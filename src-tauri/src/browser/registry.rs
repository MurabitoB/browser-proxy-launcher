#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

#[cfg(target_os = "windows")]
pub fn get_chrome_from_registry() -> Result<String, Box<dyn std::error::Error>> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let chrome_key = hklm.open_subkey(r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe")?;
    let path: String = chrome_key.get_value("")?;
    Ok(path)
}

#[cfg(target_os = "windows")]
pub fn get_edge_from_registry() -> Result<String, Box<dyn std::error::Error>> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let edge_key = hklm.open_subkey(r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe")?;
    let path: String = edge_key.get_value("")?;
    Ok(path)
}