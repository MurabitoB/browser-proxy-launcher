mod autostart;
mod browser;
mod commands;
mod settings;

use browser::detector;
use settings::SettingsManager;
use tauri::Manager;

#[tauri::command]
fn quit_app(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}

fn initialize_app() -> Result<(), Box<dyn std::error::Error>> {
    println!("Initializing application...");

    let settings_manager = SettingsManager::new()?;
    let mut settings = settings_manager.load_settings()?;

    // Detect browsers if not already detected
    if settings.browsers.is_empty() {
        println!("Detecting browsers...");
        let detected_browsers = detector::detect_all_browsers();
        println!("Detected {} browsers", detected_browsers.len());

        settings.browsers = detected_browsers;
        settings_manager.save_settings(&settings)?;
        println!("Browsers saved to settings");
    } else {
        println!(
            "Browsers already detected: {} browsers",
            settings.browsers.len()
        );
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::detect_browsers,
            commands::browse_for_browser_executable,
            commands::browse_save_file,
            commands::browse_open_file,
            commands::load_settings,
            commands::save_settings,
            commands::get_settings_path,
            commands::get_autostart_status,
            commands::set_autostart,
            commands::export_settings,
            commands::import_settings,
            commands::launch_site,
            commands::launch_proxy,
            quit_app
        ])
        .setup(|app| {
            // Initialize application settings and detect browsers
            if let Err(e) = initialize_app() {
                eprintln!("Failed to initialize application: {}", e);
            }

            // Check if launched with --minimized flag (auto-start)
            let args: Vec<String> = std::env::args().collect();
            let is_minimized = args.iter().any(|arg| arg == "--minimized");

            // Handle window close event - hide instead of quit
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        // Prevent the default close behavior
                        api.prevent_close();
                        // Hide the window instead
                        if let Err(e) = window_clone.hide() {
                            eprintln!("Failed to hide window: {}", e);
                        }
                    }
                });

                // If launched minimized (auto-start), hide the window initially
                if is_minimized {
                    println!("Application launched minimized (auto-start), hiding window");
                    if let Err(e) = window.hide() {
                        eprintln!("Failed to hide window on startup: {}", e);
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
