"use client";

import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import {
  TrayIcon,
  TrayIconEvent,
  TrayIconEventType,
} from "@tauri-apps/api/tray";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { Menu, Submenu, MenuItem } from "@tauri-apps/api/menu";
import { TauriAPI } from "@/lib/tauri-api";
import { ProxyConfig, SiteConfig } from "@/types";

interface TrayManagerProps {
  children: React.ReactNode;
}

const clickHandler = (event: any) => {
  switch (event) {
    case "Click":
      TauriAPI.toggleWindow();
      break;
    case "DoubleClick":
      console.log("Tray icon double clicked");
      break;
    case "Enter":
      console.log("Tray icon mouse entered");
      break;
    case "Move":
      console.log("Tray icon mouse moved");
      break;
    case "Leave":
      console.log("Tray icon mouse left");
      break;
  }
};

export async function createContextMenu(
  tray: TrayIcon,
  sites: SiteConfig[],
  proxies: ProxyConfig[]
) {
  const siteMenuItems = await Promise.all(
    sites.map((site) =>
      MenuItem.new({
        id: site.id,
        text: site.name,
        action: async () => {
          await TauriAPI.launchSite(site.id);
        },
      })
    )
  );

  const proxyMenuItems = await Promise.all(
    proxies.map((proxy) =>
      MenuItem.new({
        id: proxy.id,
        text: proxy.name,
        action: async () => {
          await TauriAPI.launchProxy(proxy.id);
        },
      })
    )
  );

  const launchSitesSubMenu = await Submenu.new({
    text: "Launch Sites",
    items: siteMenuItems,
  });

  const launchProxiesSubMenu = await Submenu.new({
    text: "Launch Proxies",
    items: proxyMenuItems,
  });

  const quitMenuItem = await MenuItem.new({
    id: "quit",
    text: "Quit",
    action: async () => {
      await TauriAPI.quitApp();
    },
  });

  const menu = await Menu.new({
    items: [launchSitesSubMenu, launchProxiesSubMenu, quitMenuItem],
  });

  tray.setMenu(menu);
}

export function TrayManager({ children }: TrayManagerProps) {
  const { sites, proxies } = useAppData();
  const [tray, setTray] = useState<TrayIcon | null>(null);
  const isCreatingTray = useRef(false);

  useEffect(() => {
    const createTray = async () => {
      if (isCreatingTray.current) return;
      isCreatingTray.current = true;

      try {
        const options = {
          icon: (await defaultWindowIcon())!,
          menuOnLeftClick: false,
          action: (event: TrayIconEvent) => {
            switch (event.type) {
              case "Click":
                console.log("Tray icon clicked");
                break;
              case "DoubleClick":
                TauriAPI.toggleWindow();
                console.log("Tray icon double clicked");
                break;
              case "Enter":
                console.log("Tray icon mouse entered");
                break;
              case "Move":
                console.log("Tray icon mouse moved");
                break;
              case "Leave":
                console.log("Tray icon mouse left");
                break;
            }
          },
        };
        const newTray = await TrayIcon.new(options);

        setTray(newTray);
      } finally {
        isCreatingTray.current = false;
      }
    };

    if (!tray) {
      createTray();
    }
  }, [tray]);

  useEffect(() => {
    if (tray) {
      createContextMenu(tray, sites, proxies);
    }
  }, [tray, sites, proxies]);

  return <>{children}</>;
}
