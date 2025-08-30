export interface ProxyConfig {
  id: string;
  name: string;
  type: "http" | "https" | "socks5";
  host: string;
  port: number;
  username?: string;
  password?: string;
  isActive?: boolean;
}

export interface SiteConfig {
  id: string;
  name: string;
  url: string;
  browser: Browser;
  proxyId?: string;
}

export interface Browser {
  id: string;
  name: string;
  path: string;
}

export interface ProxyStatus {
  configured: number;
  active: number;
  lastTested?: string;
}

export interface AppSettings {
  defaultBrowser: string;
  autoTestProxies: boolean;
  theme: "light" | "dark" | "system";
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  maxRecentItems: number;
}
