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
    type: "http",
    host: "127.0.0.1",
    port: 8080,
    isActive: false,
  },
  {
    id: "2",
    name: "SOCKS Proxy",
    type: "socks5",
    host: "proxy.example.com",
    port: 1080,
    username: "user",
    password: "pass",
    isActive: true,
  },
  {
    id: "3",
    name: "HTTPS Proxy",
    type: "https",
    host: "secure.proxy.com",
    port: 443,
    isActive: false,
  },
];

export const mockSites: SiteConfig[] = [
  {
    id: "1",
    name: "Google",
    url: "https://www.google.com",
    browser: mockBrowsers[0],
    proxyId: "1",
  },
  {
    id: "2",
    name: "GitHub",
    url: "https://github.com",
    browser: mockBrowsers[1],
    proxyId: "2",
  },
  {
    id: "3",
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    browser: mockBrowsers[0],
  },
];

export const mockSettings: AppSettings = {
  defaultBrowser: "chrome",
  autoTestProxies: true,
  theme: "system",
  launchOnStartup: false,
  minimizeToTray: true,
  closeToTray: false,
  maxRecentItems: 10,
};
