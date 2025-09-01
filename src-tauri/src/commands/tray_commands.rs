use crate::commands::browser_commands::{launch_site, launch_proxy};
use crate::settings::SettingsManager;
use tauri::menu::Submenu;
use tauri::{AppHandle, Manager};
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};

// Removed launch_site_from_tray - moved to browser_commands.rs as launch_site
// Removed get_sites_for_tray - use load_settings command instead
// The SiteInfo struct is no longer needed as we use SiteConfig from settings

// Global tray instance management
static TRAY_INSTANCE: Mutex<Option<tauri::tray::TrayIconId>> = Mutex::new(None);
static TRAY_CREATION_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

pub fn create_system_tray(app: &AppHandle) -> tauri::Result<()> {
    // Prevent concurrent tray creation
    if TRAY_CREATION_IN_PROGRESS.compare_exchange(false, true, Ordering::Acquire, Ordering::Relaxed).is_err() {
        println!("Tray creation already in progress, skipping...");
        return Ok(());
    }
    
    // Call the actual implementation and ensure we reset the flag regardless of outcome
    let result = create_system_tray_impl(app);
    TRAY_CREATION_IN_PROGRESS.store(false, Ordering::Release);
    result
}

fn create_system_tray_impl(app: &AppHandle) -> tauri::Result<()> {
    use tauri::{
        menu::{Menu, MenuItem, PredefinedMenuItem},
        tray::TrayIconBuilder,
    };

    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;

    // Create sites submenu
    let sites_submenu = create_sites_submenu(app)?;
    
    // Create proxies submenu
    let proxies_submenu = create_proxies_submenu(app)?;

    let menu = Menu::with_items(app, &[&sites_submenu, &proxies_submenu, &separator, &quit])?;

    // Remove existing tray if it exists - ensure complete cleanup
    if let Ok(mut tray_guard) = TRAY_INSTANCE.lock() {
        if let Some(existing_tray_id) = tray_guard.take() {
            println!("Removing existing tray with ID: {:?}", existing_tray_id);
            if let Some(_removed_tray) = app.remove_tray_by_id(&existing_tray_id) {
                println!("Successfully removed existing tray");
            } else {
                eprintln!("Failed to remove existing tray - tray not found");
            }
            
            // Add a longer delay to ensure the old tray is completely removed
            // This prevents event handler conflicts
            std::thread::sleep(std::time::Duration::from_millis(200));
            println!("Proceeding to create new tray after cleanup delay");
        } else {
            println!("No existing tray to remove");
        }
    } else {
        println!("Failed to acquire tray lock");
    }

    let tray = TrayIconBuilder::new()
        .menu(&menu)
        .icon(app.default_window_icon().unwrap().clone())
        .on_menu_event(|app, event| {
            let event_id = event.id.as_ref();
            match event_id {
                "quit" => {
                    app.exit(0);
                }
                id if id.starts_with("site_") => {
                    if let Some(site_id) = id.strip_prefix("site_") {
                        let site_id = site_id.to_string();
                        let app_handle = app.clone();
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = launch_site(site_id, app_handle).await {
                                eprintln!("Failed to launch site: {}", e);
                            }
                        });
                    }
                }
                id if id.starts_with("proxy_") => {
                    if let Some(proxy_id) = id.strip_prefix("proxy_") {
                        let proxy_id = proxy_id.to_string();
                        let app_handle = app.clone();
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = launch_proxy(proxy_id, app_handle).await {
                                eprintln!("Failed to launch proxy: {}", e);
                            }
                        });
                    }
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    match window.is_visible() {
                        Ok(true) => {
                            let _ = window.hide();
                        }
                        Ok(false) => {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                        Err(_) => {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
            }
        })
        .build(app)?;

    // Store the new tray instance ID
    if let Ok(mut tray_guard) = TRAY_INSTANCE.lock() {
        *tray_guard = Some(tray.id().clone());
        println!("New tray created with ID: {:?}", tray.id());
    } else {
        eprintln!("Failed to store new tray ID");
    }
    
    println!("System tray creation completed successfully");
    Ok(())
}

#[tauri::command]
pub async fn refresh_system_tray(app_handle: tauri::AppHandle) -> Result<(), String> {
    create_system_tray(&app_handle).map_err(|e| format!("Failed to refresh system tray: {}", e))
}

fn create_sites_submenu(app: &AppHandle) -> tauri::Result<Submenu<tauri::Wry>> {
    use tauri::menu::{MenuItem, Submenu};

    // Load sites from settings
    let settings_manager = match SettingsManager::new() {
        Ok(sm) => sm,
        Err(_) => {
            // If we can't load settings, create an empty submenu
            let no_sites =
                MenuItem::with_id(app, "no_sites", "No sites configured", false, None::<&str>)?;
            return Submenu::with_items(app, "Launch Sites", true, &[&no_sites]);
        }
    };

    let settings = match settings_manager.load_settings() {
        Ok(s) => s,
        Err(_) => {
            let no_sites =
                MenuItem::with_id(app, "no_sites", "No sites configured", false, None::<&str>)?;
            return Submenu::with_items(app, "Launch Sites", true, &[&no_sites]);
        }
    };

    if settings.sites.is_empty() {
        let no_sites =
            MenuItem::with_id(app, "no_sites", "No sites configured", false, None::<&str>)?;
        return Submenu::with_items(app, "Launch Sites", true, &[&no_sites]);
    }

    // Create menu items for each site
    let mut site_items = Vec::new();
    for site in &settings.sites {
        let menu_item = MenuItem::with_id(
            app,
            &format!("site_{}", site.id),
            &site.name,
            true,
            None::<&str>,
        )?;
        site_items.push(menu_item);
    }

    // Convert to references for the submenu
    let site_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = site_items
        .iter()
        .map(|item| item as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
        .collect();

    Submenu::with_items(app, "Launch Sites", true, &site_refs)
}

fn create_proxies_submenu(app: &AppHandle) -> tauri::Result<Submenu<tauri::Wry>> {
    use tauri::menu::{MenuItem, Submenu};

    // Load proxies from settings
    let settings_manager = match SettingsManager::new() {
        Ok(sm) => sm,
        Err(_) => {
            // If we can't load settings, create an empty submenu
            let no_proxies =
                MenuItem::with_id(app, "no_proxies", "No proxies configured", false, None::<&str>)?;
            return Submenu::with_items(app, "Launch Proxies", true, &[&no_proxies]);
        }
    };

    let settings = match settings_manager.load_settings() {
        Ok(s) => s,
        Err(_) => {
            let no_proxies =
                MenuItem::with_id(app, "no_proxies", "No proxies configured", false, None::<&str>)?;
            return Submenu::with_items(app, "Launch Proxies", true, &[&no_proxies]);
        }
    };

    if settings.proxies.is_empty() {
        let no_proxies =
            MenuItem::with_id(app, "no_proxies", "No proxies configured", false, None::<&str>)?;
        return Submenu::with_items(app, "Launch Proxies", true, &[&no_proxies]);
    }

    // Create menu items for each proxy
    let mut proxy_items = Vec::new();
    for proxy in &settings.proxies {
        let menu_item = MenuItem::with_id(
            app,
            &format!("proxy_{}", proxy.id),
            &proxy.name,
            true,
            None::<&str>,
        )?;
        proxy_items.push(menu_item);
    }

    // Convert to references for the submenu
    let proxy_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = proxy_items
        .iter()
        .map(|item| item as &dyn tauri::menu::IsMenuItem<tauri::Wry>)
        .collect();

    Submenu::with_items(app, "Launch Proxies", true, &proxy_refs)
}
