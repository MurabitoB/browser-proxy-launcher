"use client";

import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { TauriAPI } from "@/lib/tauri-api";
import { useAppData } from "@/hooks/useAppData";

interface TrayManagerProps {
  children: React.ReactNode;
}

export function TrayManager({ children }: TrayManagerProps) {
  const { sites } = useAppData();

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupTrayListener = async () => {
      try {
        unlisten = await listen("tray-sites-clicked", async () => {
          console.log("Tray sites menu clicked");

          // Show a simple context menu or launch the first available site
          if (sites.length > 0) {
            // For demonstration, launch the first site
            // In a real implementation, you might want to show a popup menu
            try {
              await TauriAPI.launchSite(sites[0].id);
              console.log(`Launched ${sites[0].name} from tray`);
            } catch (error) {
              console.error("Failed to launch site from tray:", error);
            }
          } else {
            console.log("No sites available to launch");
          }
        });
      } catch (error) {
        console.error("Failed to setup tray listener:", error);
      }
    };

    setupTrayListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [sites]);

  return <>{children}</>;
}
