"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ProxyStatus } from "@/components/ProxyStatus";
import { FavoritesList } from "@/components/FavoritesList";
import { ProxyList } from "@/components/ProxyList";
import { mockProxies, mockFavorites } from "@/lib/mock-data";
import { ProxyConfig, FavoriteConfig } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [proxies, setProxies] = useState<ProxyConfig[]>(mockProxies);
  const [favorites, setFavorites] = useState<FavoriteConfig[]>(mockFavorites);

  const proxyStatus = {
    configured: proxies.length,
    active: proxies.filter((p) => p.isActive).length,
    lastTested: new Date().toISOString(),
  };

  const handleLaunchFavorite = (favorite: FavoriteConfig) => {
    console.log("Launching:", favorite);
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

  const handleAddFavorite = () => {
    console.log("Adding new favorite");
    // TODO: 顯示新增對話框
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSettingsClick={() => router.push("/settings")}
        onAboutClick={() => router.push("/about")}
      />

      <div className="p-6 space-y-6 max-w-7xl">
        {/* Proxy Status */}
        <div className="max-w-md">
          <ProxyStatus status={proxyStatus} />
        </div>

        {/* Favorites Section */}
        <FavoritesList
          favorites={favorites}
          onLaunch={handleLaunchFavorite}
          onAddFavorite={handleAddFavorite}
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
