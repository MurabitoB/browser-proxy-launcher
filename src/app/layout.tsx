import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/components/QueryProvider";
import { TrayManager } from "@/components/TrayManager";

export const metadata: Metadata = {
  title: "Browser Proxy Launcher",
  description: "A Tauri app built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ThemeProvider>
            <TrayManager>{children}</TrayManager>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
