use crate::browser::Browser;
use serde::{Deserialize, Serialize};

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
    pub default_browser: String,
    pub theme: String, // "light", "dark", "system"
    pub launch_on_startup: bool,
    pub ignore_cert_errors: bool,
    pub browsers: Vec<Browser>,
    pub proxies: Vec<ProxyConfig>,
    pub sites: Vec<SiteConfig>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            default_browser: "chrome".to_string(),
            theme: "system".to_string(),
            launch_on_startup: false,
            ignore_cert_errors: false,
            browsers: Vec::new(),
            proxies: Vec::new(),
            sites: Vec::new(),
        }
    }
}
