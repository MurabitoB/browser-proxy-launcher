use super::Browser;

#[cfg(target_os = "windows")]
use super::registry::{get_chrome_from_registry, get_edge_from_registry};

pub fn detect_all_browsers() -> Vec<Browser> {
    let mut browsers = Vec::new();
    
    // Detect Chrome
    if let Some(chrome_path) = detect_chrome() {
        browsers.push(Browser {
            id: "chrome".to_string(),
            name: "Google Chrome".to_string(),
            path: chrome_path,
        });
    }
    
    // Detect Edge
    if let Some(edge_path) = detect_edge() {
        browsers.push(Browser {
            id: "edge".to_string(),
            name: "Microsoft Edge".to_string(),
            path: edge_path,
        });
    }
    
    browsers
}

fn detect_chrome() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        // Try common Chrome installation paths on Windows
        let possible_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ];
        
        for path in &possible_paths {
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
        
        // Try to get from Windows Registry
        if let Ok(chrome_path) = get_chrome_from_registry() {
            return Some(chrome_path);
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        let path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        if std::path::Path::new(path).exists() {
            return Some(path.to_string());
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        let possible_paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/chromium-browser",
            "/usr/bin/chromium",
        ];
        
        for path in &possible_paths {
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
    }
    
    None
}

fn detect_edge() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        // Try common Edge installation paths on Windows
        let possible_paths = [
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        ];
        
        for path in &possible_paths {
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
        
        // Try to get from Windows Registry
        if let Ok(edge_path) = get_edge_from_registry() {
            return Some(edge_path);
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        let path = "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
        if std::path::Path::new(path).exists() {
            return Some(path.to_string());
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        let possible_paths = [
            "/usr/bin/microsoft-edge",
            "/usr/bin/microsoft-edge-stable",
        ];
        
        for path in &possible_paths {
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }
    }
    
    None
}