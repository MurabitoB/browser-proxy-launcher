use serde::{Deserialize, Serialize};

pub mod detector;

#[cfg(target_os = "windows")]
pub mod registry;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Browser {
    pub id: String,
    pub name: String,
    pub path: String,
}