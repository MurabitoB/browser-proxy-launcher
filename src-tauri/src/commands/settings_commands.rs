use crate::autostart::AutoStartManager;
use crate::settings::{AppSettings, SettingsManager};
use crate::commands::tray_commands::refresh_system_tray;
use std::env;

fn is_development_mode() -> bool {
    // Check if we're running in development mode
    if let Ok(current_exe) = env::current_exe() {
        let path_str = current_exe.to_string_lossy();
        // Common indicators of development mode
        path_str.contains("target")
            || path_str.contains("debug")
            || path_str.contains("dev")
            || path_str.contains("cargo")
    } else {
        // If we can't get the exe path, assume development mode for safety
        true
    }
}

#[tauri::command]
pub async fn load_settings() -> Result<AppSettings, String> {
    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    let mut settings = settings_manager
        .load_settings()
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    // Check current auto-start status and sync with settings
    if let Ok(auto_start_manager) = AutoStartManager::new() {
        if let Ok(is_enabled) = auto_start_manager.is_enabled() {
            // If the actual auto-start status doesn't match settings, update settings
            if settings.launch_on_startup != is_enabled {
                println!("Auto-start status mismatch. Settings: {}, Actual: {}. Syncing to actual status.", 
                         settings.launch_on_startup, is_enabled);
                settings.launch_on_startup = is_enabled;
                // Save the corrected settings
                let _ = settings_manager.save_settings(&settings);
            }
        }
    }

    Ok(settings)
}

#[tauri::command]
pub async fn save_settings(settings: AppSettings, app_handle: tauri::AppHandle) -> Result<(), String> {
    println!("Saving settings: {:?}", settings);

    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    // Clean up sites that reference non-existent proxies
    let mut cleaned_settings = settings.clone();

    let proxy_ids: std::collections::HashSet<String> = cleaned_settings
        .proxies
        .iter()
        .map(|p| p.id.clone())
        .collect();

    let original_site_count = cleaned_settings.sites.len();
    cleaned_settings.sites.retain(|site| {
        if let Some(proxy_id) = &site.proxy_id {
            if !proxy_ids.contains(proxy_id) {
                println!(
                    "Removing site '{}' (ID: {}) because it references non-existent proxy '{}'",
                    site.name, site.id, proxy_id
                );
                return false;
            }
        }
        true
    });

    let removed_count = original_site_count - cleaned_settings.sites.len();
    if removed_count > 0 {
        println!(
            "Removed {} site(s) that referenced non-existent proxies",
            removed_count
        );
    }

    // Save the cleaned settings
    settings_manager
        .save_settings(&cleaned_settings)
        .map_err(|e| format!("Failed to save settings: {}", e))?;

    // Update auto-start status based on the launch_on_startup setting
    // Skip in development mode to avoid errors
    if !is_development_mode() {
        let auto_start_manager = AutoStartManager::new()
            .map_err(|e| format!("Failed to create auto-start manager: {}", e))?;

        auto_start_manager
            .set_enabled(cleaned_settings.launch_on_startup)
            .map_err(|e| format!("Failed to update auto-start setting: {}", e))?;

        println!(
            "Settings saved successfully with auto-start: {}",
            cleaned_settings.launch_on_startup
        );
    } else {
        println!(
            "Settings saved successfully (development mode, auto-start skipped): {}",
            cleaned_settings.launch_on_startup
        );
    }

    // Refresh system tray to reflect changes in sites
    if let Err(e) = refresh_system_tray(app_handle.clone()).await {
        eprintln!("Failed to refresh system tray: {}", e);
        // Don't fail the save operation if tray refresh fails
    }

    Ok(())
}

#[tauri::command]
pub async fn get_settings_path() -> Result<String, String> {
    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    Ok(settings_manager
        .get_config_path()
        .to_string_lossy()
        .to_string())
}

#[tauri::command]
pub async fn get_autostart_status() -> Result<bool, String> {
    if is_development_mode() {
        println!("Development mode detected, returning false for autostart status");
        return Ok(false);
    }

    let auto_start_manager = AutoStartManager::new()
        .map_err(|e| format!("Failed to create auto-start manager: {}", e))?;

    auto_start_manager
        .is_enabled()
        .map_err(|e| format!("Failed to get auto-start status: {}", e))
}

#[tauri::command]
pub async fn set_autostart(enabled: bool) -> Result<(), String> {
    if is_development_mode() {
        println!(
            "Development mode detected, skipping autostart setting: {}",
            enabled
        );
        return Ok(());
    }

    let auto_start_manager = AutoStartManager::new()
        .map_err(|e| format!("Failed to create auto-start manager: {}", e))?;

    auto_start_manager
        .set_enabled(enabled)
        .map_err(|e| format!("Failed to set auto-start: {}", e))
}

#[tauri::command]
pub async fn export_settings(file_path: String) -> Result<(), String> {
    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    let settings = settings_manager
        .load_settings()
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    let json_string = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    std::fs::write(&file_path, json_string)
        .map_err(|e| format!("Failed to write settings to file: {}", e))?;

    println!("Settings exported to: {}", file_path);
    Ok(())
}

#[tauri::command]
pub async fn import_settings(file_path: String, app_handle: tauri::AppHandle) -> Result<AppSettings, String> {
    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;

    let settings: AppSettings = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings file: {}", e))?;

    let settings_manager =
        SettingsManager::new().map_err(|e| format!("Failed to create settings manager: {}", e))?;

    settings_manager
        .save_settings(&settings)
        .map_err(|e| format!("Failed to save imported settings: {}", e))?;

    // Update auto-start status based on the imported settings
    let auto_start_manager = AutoStartManager::new()
        .map_err(|e| format!("Failed to create auto-start manager: {}", e))?;

    auto_start_manager
        .set_enabled(settings.launch_on_startup)
        .map_err(|e| format!("Failed to update auto-start setting: {}", e))?;

    // Refresh system tray to reflect imported settings
    if let Err(e) = refresh_system_tray(app_handle.clone()).await {
        eprintln!("Failed to refresh system tray after import: {}", e);
        // Don't fail the import operation if tray refresh fails
    }

    println!("Settings imported from: {}", file_path);
    Ok(settings)
}

#[tauri::command]
pub async fn browse_save_file(
    app_handle: tauri::AppHandle,
    default_filename: String,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("JSON files", &["json"])
        .set_file_name(&default_filename)
        .blocking_save_file();

    match file_path {
        Some(file_path) => Ok(file_path.to_string()),
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
pub async fn browse_open_file(
    app_handle: tauri::AppHandle,
    filters: Vec<String>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let mut dialog = app_handle.dialog().file();

    if !filters.is_empty() {
        dialog = dialog.add_filter(
            "Supported files",
            &filters.iter().map(|s| s.as_str()).collect::<Vec<_>>(),
        );
    }

    let file_path = dialog.blocking_pick_file();

    match file_path {
        Some(file_path) => Ok(file_path.to_string()),
        None => Err("No file selected".to_string()),
    }
}
