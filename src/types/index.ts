export interface ProxyConfig {
  id: string;
  name: string;
  proxy_type: "http" | "socks5" | "pac";
  host: string;
  port: number;
  username?: string;
  password?: string;
  url?: string; // PAC URL
}

export interface SiteConfig {
  id: string;
  name: string;
  url: string;
  browser_id: string;
  proxy_id?: string;
}

export interface Browser {
  id: string;
  name: string;
  path: string;
}

export interface AppSettings {
  default_browser: string;
  default_launch_url: string;
  theme: "light" | "dark" | "system";
  launch_on_startup: boolean;
  ignore_cert_errors: boolean;
  browsers: Browser[];
  sites: SiteConfig[];
  proxies: ProxyConfig[];
}
