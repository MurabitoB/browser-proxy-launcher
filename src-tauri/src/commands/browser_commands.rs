use crate::browser::{detector, Browser};
use crate::settings::{SettingsManager, ProxyConfig};

struct LaunchConfig {
    browser: Browser,
    proxy: Option<ProxyConfig>,
    url: Option<String>,
    profile_name: String,
    ignore_cert_errors: bool,
}

fn launch_browser_with_config(config: LaunchConfig) -> Result<(), String> {
    let mut command = std::process::Command::new(&config.browser.path);

    // Set default profile directory
    command.arg("--profile-directory=Default");

    // Add certificate error ignore flag if enabled
    if config.ignore_cert_errors {
        command.arg("--ignore-certificate-errors");
        command.arg("--ignore-ssl-errors");
        command.arg("--ignore-certificate-errors-spki-list");
        command.arg("--ignore-certificate-errors-ssl-invalid");
        command.arg("--allow-running-insecure-content");
    }

    // Add proxy arguments if needed
    if let Some(proxy) = config.proxy {
        // Generate profile path based on profile name
        let profile_path = format!("./profiles/{}", config.profile_name);
        
        // Get the settings directory and resolve profile path
        let settings_manager = SettingsManager::new()
            .map_err(|e| format!("Failed to create settings manager: {}", e))?;
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

    // Add URL if specified, otherwise browser will open to home page
    if let Some(url) = &config.url {
        command.arg(url);
    }

    // Launch the browser
    match command.spawn() {
        Ok(_) => {
            let target = config.url.as_deref().unwrap_or("home page");
            println!("Successfully launched {} with {}", target, config.browser.name);
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to launch browser: {}", e);
            Err(format!("Failed to launch browser: {}", e))
        }
    }
}

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

    // Find the proxy if specified
    let proxy = if let Some(proxy_id) = &site.proxy_id {
        settings.proxies.iter().find(|p| p.id == *proxy_id).cloned()
    } else {
        None
    };

    // Create launch configuration
    let config = LaunchConfig {
        browser: browser.clone(),
        proxy,
        url: Some(site.url.clone()),
        profile_name: format!("site-{}", site.name),
        ignore_cert_errors: settings.ignore_cert_errors,
    };

    launch_browser_with_config(config)
}

#[tauri::command]
pub async fn launch_proxy(proxy_id: String, _app_handle: tauri::AppHandle) -> Result<(), String> {
    println!("Testing proxy: {}", proxy_id);

    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    let settings = settings_manager
        .load_settings()
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    // Find the proxy by ID
    let proxy = settings
        .proxies
        .iter()
        .find(|p| p.id == proxy_id)
        .ok_or_else(|| format!("Proxy with ID {} not found", proxy_id))?;

    // Find the default browser
    let default_browser = settings
        .browsers
        .iter()
        .find(|b| b.id == settings.default_browser)
        .or_else(|| settings.browsers.first())
        .ok_or_else(|| "No browsers available".to_string())?;

    // Create launch configuration
    let config = LaunchConfig {
        browser: default_browser.clone(),
        proxy: Some(proxy.clone()),
        url: None, // Open browser home page to test proxy connection
        profile_name: format!("test-{}", proxy.name),
        ignore_cert_errors: settings.ignore_cert_errors,
    };

    launch_browser_with_config(config)
}
