import { ProxyConfig, SiteConfig, Browser, AppSettings } from "@/types";

export const mockBrowsers: Browser[] = [
  {
    id: "chrome",
    name: "Chrome",
    path: "/Applications/Google Chrome.app",
  },
  {
    id: "edge",
    name: "Edge",
    path: "/Applications/Microsoft Edge.app",
  },
];

export const mockProxies: ProxyConfig[] = [
  {
    id: "1",
    name: "Local Proxy",
    proxy_type: "http",
    host: "127.0.0.1",
    port: 8080,
  },
  {
    id: "2",
    name: "SOCKS Proxy",
    proxy_type: "socks5",
    host: "proxy.example.com",
    port: 1080,
    username: "user",
    password: "pass",
  },
  {
    id: "3",
    name: "HTTP Proxy",
    proxy_type: "http",
    host: "secure.proxy.com",
    port: 443,
  },
];

export const mockSites: SiteConfig[] = [
  {
    id: "1",
    name: "Google",
    url: "https://www.google.com",
    browser_id: "chrome",
    proxy_id: "1",
  },
  {
    id: "2",
    name: "GitHub",
    url: "https://github.com",
    browser_id: "edge",
    proxy_id: "2",
  },
  {
    id: "3",
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    browser_id: "chrome",
  },
];

export const mockSettings: AppSettings = {
  default_browser: "chrome",
  default_launch_url: "https://www.google.com",
  theme: "system",
  launch_on_startup: false,
  ignore_cert_errors: false,
  sites: mockSites,
  proxies: mockProxies,
  browsers: mockBrowsers,
};
