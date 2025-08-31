use crate::browser::{detector, Browser};
use crate::settings::SettingsManager;

#[tauri::command]
pub async fn detect_browsers() -> Result<Vec<Browser>, String> {
    Ok(detector::detect_all_browsers())
}

#[tauri::command]
pub async fn browse_for_browser_executable(app_handle: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("Executable files", &["exe"])
        .blocking_pick_file();

    match file_path {
        Some(file_path) => {
            // Try to get the path as a string
            Ok(file_path.to_string())
        }
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
pub async fn launch_site(site_id: String, _app_handle: tauri::AppHandle) -> Result<(), String> {
    println!("Launching site: {}", site_id);

    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    let settings = settings_manager
        .load_settings()
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    // Find the site by ID
    let site = settings
        .sites
        .iter()
        .find(|s| s.id == site_id)
        .ok_or_else(|| format!("Site with ID {} not found", site_id))?;

    // Find the browser
    let browser = settings
        .browsers
        .iter()
        .find(|b| b.id == site.browser_id)
        .ok_or_else(|| format!("Browser with ID {} not found", site.browser_id))?;

    // Launch the site with the specified browser
    let mut command = std::process::Command::new(&browser.path);

    // Add new window flag to always open in a new window
    command.arg("--new-window");

    // Add certificate error ignore flag if enabled
    if settings.ignore_cert_errors {
        command.arg("--ignore-certificate-errors");
        command.arg("--ignore-ssl-errors");
        command.arg("--ignore-certificate-errors-spki-list");
        command.arg("--ignore-certificate-errors-ssl-invalid");
        command.arg("--allow-running-insecure-content");
    }

    // Add proxy arguments if needed
    if let Some(proxy_id) = &site.proxy_id {
        if let Some(proxy) = settings.proxies.iter().find(|p| p.id == *proxy_id) {
            // Generate profile path based on proxy name (convention-based)
            let profile_path = format!("./profiles/{}", proxy.name);

            // Get the settings directory and resolve profile path
            let settings_dir = settings_manager
                .get_settings_dir()
                .map_err(|e| format!("Failed to get settings directory: {}", e))?;
            let full_profile_path = settings_dir.join(&profile_path);

            // Create profile directory if it doesn't exist
            if let Some(parent) = full_profile_path.parent() {
                if !parent.exists() {
                    std::fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create profile directory: {}", e))?;
                }
            }

            command.arg(&format!(
                "--user-data-dir={}",
                full_profile_path.to_string_lossy()
            ));

            match proxy.proxy_type.as_str() {
                "http" => {
                    let proxy_url = if let (Some(username), Some(password)) =
                        (&proxy.username, &proxy.password)
                    {
                        format!(
                            "http://{}:{}@{}:{}",
                            username, password, proxy.host, proxy.port
                        )
                    } else {
                        format!("http://{}:{}", proxy.host, proxy.port)
                    };
                    command.arg(&format!("--proxy-server={}", proxy_url));
                }
                "socks5" => {
                    let proxy_url = if let (Some(username), Some(password)) =
                        (&proxy.username, &proxy.password)
                    {
                        format!(
                            "socks5://{}:{}@{}:{}",
                            username, password, proxy.host, proxy.port
                        )
                    } else {
                        format!("socks5://{}:{}", proxy.host, proxy.port)
                    };
                    command.arg(&format!("--proxy-server={}", proxy_url));
                }
                "pac" => {
                    if let Some(pac_url) = &proxy.url {
                        command.arg(&format!("--proxy-pac-url={}", pac_url));
                    }
                }
                _ => {}
            }
        }
    }

    command.arg(&site.url);

    // Launch the browser
    match command.spawn() {
        Ok(_) => {
            println!("Successfully launched {} with {}", site.name, browser.name);
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to launch browser: {}", e);
            Err(format!("Failed to launch browser: {}", e))
        }
    }
}
