use crate::commands::browser_commands::launch_site;
use crate::settings::SettingsManager;
use tauri::menu::Submenu;
use tauri::{AppHandle, Manager};
use std::sync::Mutex;

// Removed launch_site_from_tray - moved to browser_commands.rs as launch_site
// Removed get_sites_for_tray - use load_settings command instead
// The SiteInfo struct is no longer needed as we use SiteConfig from settings

// Global tray instance management
static TRAY_INSTANCE: Mutex<Option<tauri::tray::TrayIconId>> = Mutex::new(None);

pub fn create_system_tray(app: &AppHandle) -> tauri::Result<()> {
    use tauri::{
        menu::{Menu, MenuItem, PredefinedMenuItem},
        tray::TrayIconBuilder,
    };

    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;

    // Create sites submenu
    let sites_submenu = create_sites_submenu(app)?;

    let menu = Menu::with_items(app, &[&sites_submenu, &separator, &quit])?;

    // Remove existing tray if it exists
    if let Ok(mut tray_guard) = TRAY_INSTANCE.lock() {
        if let Some(existing_tray_id) = tray_guard.take() {
            let _ = app.remove_tray_by_id(&existing_tray_id);
        }
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
    }

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
