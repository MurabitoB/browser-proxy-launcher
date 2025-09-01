use crate::browser::Browser;
use serde::{Deserialize, Serialize};

fn default_browser() -> String {
    "chrome".to_string()
}

fn default_launch_url() -> String {
    "https://ipinfo.io".to_string()
}

fn default_theme() -> String {
    "system".to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProxyConfig {
    pub id: String,
    pub name: String,
    pub proxy_type: String, // "http", "socks5", "pac"
    pub host: String,
    pub port: u16,
    pub username: Option<String>,
    pub password: Option<String>,
    pub url: Option<String>, // PAC URL
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SiteConfig {
    pub id: String,
    pub name: String,
    pub url: String,
    pub browser_id: String,
    pub proxy_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    #[serde(default = "default_browser")]
    pub default_browser: String,
    #[serde(default = "default_launch_url")]
    pub default_launch_url: String,
    #[serde(default = "default_theme")]
    pub theme: String, // "light", "dark", "system"
    #[serde(default)]
    pub launch_on_startup: bool,
    #[serde(default)]
    pub ignore_cert_errors: bool,
    #[serde(default)]
    pub browsers: Vec<Browser>,
    #[serde(default)]
    pub proxies: Vec<ProxyConfig>,
    #[serde(default)]
    pub sites: Vec<SiteConfig>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            default_browser: "chrome".to_string(),
            default_launch_url: "https://www.google.com".to_string(),
            theme: "system".to_string(),
            launch_on_startup: false,
            ignore_cert_errors: false,
            browsers: Vec::new(),
            proxies: Vec::new(),
            sites: Vec::new(),
        }
    }
}
