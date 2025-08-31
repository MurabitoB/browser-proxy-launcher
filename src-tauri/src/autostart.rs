use auto_launch::AutoLaunch;
use std::env;

pub struct AutoStartManager {
    auto_launch: AutoLaunch,
}

impl AutoStartManager {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let app_name = "Browser Proxy Launcher";
        let app_path = env::current_exe()?;

        // Check if we're in development mode (path contains "target/debug" or similar)
        let path_str = app_path.to_string_lossy();
        if path_str.contains("target") || path_str.contains("dev") {
            println!("Development mode detected, auto-start functionality disabled");
            // In development mode, create a dummy AutoLaunch that won't actually work
            // but won't cause errors either
            let dummy_path = std::env::temp_dir().join("browser-proxy-launcher-dev.exe");
            let auto_launch =
                AutoLaunch::new(app_name, &dummy_path.to_string_lossy(), &["--minimized"]);
            return Ok(AutoStartManager { auto_launch });
        }

        let auto_launch = AutoLaunch::new(app_name, &app_path.to_string_lossy(), &["--minimized"]);

        Ok(AutoStartManager { auto_launch })
    }

    pub fn is_enabled(&self) -> Result<bool, Box<dyn std::error::Error>> {
        Ok(self.auto_launch.is_enabled()?)
    }

    pub fn enable(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.auto_launch.enable()?;
        println!("Auto-start enabled successfully");
        Ok(())
    }

    pub fn disable(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.auto_launch.disable()?;
        println!("Auto-start disabled successfully");
        Ok(())
    }

    pub fn set_enabled(&self, enabled: bool) -> Result<(), Box<dyn std::error::Error>> {
        if enabled {
            self.enable()
        } else {
            self.disable()
        }
    }
}
