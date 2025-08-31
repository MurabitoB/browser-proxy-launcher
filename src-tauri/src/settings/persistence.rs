use super::AppSettings;
use serde_json;
use std::fs;
use std::path::PathBuf;

pub struct SettingsManager {
    config_path: PathBuf,
}

impl SettingsManager {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let config_dir = dirs::config_dir()
            .ok_or("Could not determine config directory")?
            .join("browser-proxy-launcher");

        // Create config directory if it doesn't exist
        fs::create_dir_all(&config_dir)?;

        let config_path = config_dir.join("settings.json");

        Ok(Self { config_path })
    }

    pub fn load_settings(&self) -> Result<AppSettings, Box<dyn std::error::Error>> {
        if !self.config_path.exists() {
            // If config file doesn't exist, return default settings
            return Ok(AppSettings::default());
        }

        let contents = fs::read_to_string(&self.config_path)?;
        let settings: AppSettings = serde_json::from_str(&contents)?;
        Ok(settings)
    }

    pub fn save_settings(&self, settings: &AppSettings) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(settings)?;
        fs::write(&self.config_path, json)?;
        Ok(())
    }

    pub fn get_config_path(&self) -> &PathBuf {
        &self.config_path
    }

    pub fn get_settings_dir(&self) -> Result<PathBuf, Box<dyn std::error::Error>> {
        Ok(self
            .config_path
            .parent()
            .ok_or("Could not get settings directory")?
            .to_path_buf())
    }
}
