"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ProxyStatus } from "@/components/ProxyStatus";
import { SitesList } from "@/components/SitesList";
import { ProxyList } from "@/components/ProxyList";
import { mockProxies, mockSites } from "@/lib/mock-data";
import { ProxyConfig, SiteConfig } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [proxies, setProxies] = useState<ProxyConfig[]>(mockProxies);
  const [sites, setSites] = useState<SiteConfig[]>(mockSites);

  const proxyStatus = {
    configured: proxies.length,
    active: proxies.filter((p) => p.isActive).length,
    lastTested: new Date().toISOString(),
  };

  const handleLaunchSite = (site: SiteConfig) => {
    console.log("Launching:", site);
    // TODO: 實際啟動邏輯
  };

  const handleEditProxy = (proxy: ProxyConfig) => {
    console.log("Editing proxy:", proxy);
    // TODO: 顯示編輯對話框
  };

  const handleDeleteProxy = (proxyId: string) => {
    setProxies((prev) => prev.filter((p) => p.id !== proxyId));
  };

  const handleAddProxy = () => {
    console.log("Adding new proxy");
    // TODO: 顯示新增對話框
  };

  const handleAddSite = () => {
    console.log("Adding new site");
    // TODO: 顯示新增對話框
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSettingsClick={() => router.push("/settings")}
        onAboutClick={() => router.push("/about")}
      />

      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Proxy Status */}
        <div className="max-w-md">
          <ProxyStatus status={proxyStatus} />
        </div>

        {/* Sites Section */}
        <SitesList
          sites={sites}
          onLaunch={handleLaunchSite}
          onAddSite={handleAddSite}
        />

        {/* Proxy Management Section */}
        <ProxyList
          proxies={proxies}
          onEdit={handleEditProxy}
          onDelete={handleDeleteProxy}
          onAddProxy={handleAddProxy}
        />
      </div>
    </div>
  );
}
