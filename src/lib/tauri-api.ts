import { invoke } from '@tauri-apps/api/core'
import { Browser, AppSettings } from '@/types'

export interface TauriBrowser {
  id: string
  name: string
  path: string
}

export interface TauriProxyConfig {
  id: string
  name: string
  proxy_type: string // "http", "socks5", "pac"
  host: string
  port: number
  username?: string
  password?: string
  url?: string // PAC URL
}

export interface TauriSiteConfig {
  id: string
  name: string
  url: string
  browser_id: string
  proxy_id?: string
}

export interface TauriAppSettings {
  default_browser: string
  default_launch_url: string
  theme: string
  launch_on_startup: boolean
  ignore_cert_errors: boolean
  browsers: TauriBrowser[]
  proxies: TauriProxyConfig[]
  sites: TauriSiteConfig[]
}

export class TauriAPI {
  static async detectBrowsers(): Promise<Browser[]> {
    try {
      const browsers = await invoke<TauriBrowser[]>('detect_browsers')
      return browsers.map(browser => ({
        id: browser.id,
        name: browser.name,
        path: browser.path,
      }))
    } catch (error) {
      console.error('Failed to detect browsers:', error)
      return []
    }
  }

  static async launchSite(siteId: string): Promise<void> {
    try {
      await invoke('launch_site', { siteId })
    } catch (error) {
      console.error('Failed to launch site:', error)
      throw error
    }
  }

  static async launchProxy(proxyId: string): Promise<void> {
    try {
      await invoke('launch_proxy', { proxyId })
    } catch (error) {
      console.error('Failed to launch proxy:', error)
      throw error
    }
  }

  static async loadSettings(): Promise<AppSettings> {
    try {
      const settings = await invoke<TauriAppSettings>('load_settings')
      return {
        default_browser: settings.default_browser,
        default_launch_url: settings.default_launch_url,
        theme: settings.theme as "light" | "dark" | "system",
        launch_on_startup: settings.launch_on_startup,
        ignore_cert_errors: settings.ignore_cert_errors,
        browsers: settings.browsers,
        sites: settings.sites,
        proxies: settings.proxies.map(proxy => ({
          ...proxy,
          proxy_type: proxy.proxy_type as "http" | "socks5" | "pac",
        })),
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      throw error
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      console.log('Saving settings via TauriAPI:', settings);

      const tauriSettings: TauriAppSettings = {
        default_browser: settings.default_browser,
        default_launch_url: settings.default_launch_url,
        theme: settings.theme,
        launch_on_startup: settings.launch_on_startup,
        ignore_cert_errors: settings.ignore_cert_errors,
        browsers: settings.browsers,
        proxies: settings.proxies,
        sites: settings.sites,
      }

      console.log('Final Tauri settings to be sent:', tauriSettings);
      const result = await invoke('save_settings', { settings: tauriSettings });
      console.log('Save settings result:', result);
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  static async getSettingsPath(): Promise<string> {
    try {
      return await invoke<string>('get_settings_path')
    } catch (error) {
      console.error('Failed to get settings path:', error)
      return ''
    }
  }

  static async browseForBrowserExecutable(): Promise<string | null> {
    try {
      const result = await invoke<string | null>('browse_for_browser_executable')
      return result
    } catch (error) {
      console.error('Failed to browse for browser executable:', error)
      return null
    }
  }

  static async browseSaveFile(defaultFilename: string): Promise<string | null> {
    try {
      const result = await invoke<string>('browse_save_file', { defaultFilename })
      return result
    } catch (error) {
      console.error('Failed to browse for save file:', error)
      return null
    }
  }

  static async browseOpenFile(filters: string[]): Promise<string | null> {
    try {
      const result = await invoke<string>('browse_open_file', { filters })
      return result
    } catch (error) {
      console.error('Failed to browse for open file:', error)
      return null
    }
  }

  static async getAutostartStatus(): Promise<boolean> {
    try {
      return await invoke<boolean>('get_autostart_status')
    } catch (error) {
      console.error('Failed to get autostart status:', error)
      return false
    }
  }

  static async setAutostart(enabled: boolean): Promise<void> {
    try {
      await invoke('set_autostart', { enabled })
    } catch (error) {
      console.error('Failed to set autostart:', error)
      throw error
    }
  }

  static async exportSettings(filePath: string): Promise<void> {
    try {
      await invoke('export_settings', { filePath })
    } catch (error) {
      console.error('Failed to export settings:', error)
      throw error
    }
  }

  static async importSettings(filePath: string): Promise<AppSettings> {
    try {
      const settings = await invoke<TauriAppSettings>('import_settings', { filePath })
      return {
        default_browser: settings.default_browser,
        default_launch_url: settings.default_launch_url,
        theme: settings.theme as "light" | "dark" | "system",
        launch_on_startup: settings.launch_on_startup,
        ignore_cert_errors: settings.ignore_cert_errors,
        browsers: settings.browsers,
        sites: settings.sites,
        proxies: settings.proxies.map(proxy => ({
          ...proxy,
          proxy_type: proxy.proxy_type as "http" | "socks5" | "pac",
        })),
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw error
    }
  }

  static async quitApp(): Promise<void> {
    try {
      await invoke('quit_app')
    } catch (error) {
      console.error('Failed to quit app:', error)
      throw error
    }
  }
}