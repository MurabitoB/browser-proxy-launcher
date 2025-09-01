"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { SitesList } from "@/components/SitesList";
import { ProxyList } from "@/components/ProxyList";
import { SiteDialog } from "@/components/SiteDialog";
import { ProxyDialog } from "@/components/ProxyDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TrayManager } from "@/components/TrayManager";
import { TauriAPI } from "@/lib/tauri-api";
import { ProxyConfig, SiteConfig } from "@/types";
import { useAppData } from "@/hooks/useAppData";
import { useSaveSettings } from "@/hooks/useSettings";

export default function HomePage() {
  const router = useRouter();
  const { settings, browsers, sites, proxies, isLoading, error } = useAppData();
  const saveSettingsMutation = useSaveSettings();
  const [showSiteDialog, setShowSiteDialog] = useState(false);
  const [siteDialogMode, setSiteDialogMode] = useState<"add" | "edit">("add");
  const [editingSite, setEditingSite] = useState<SiteConfig | null>(null);
  const [showProxyDialog, setShowProxyDialog] = useState(false);
  const [proxyDialogMode, setProxyDialogMode] = useState<"add" | "edit">("add");
  const [editingProxy, setEditingProxy] = useState<ProxyConfig | null>(null);

  // Delete confirmation states
  const [showDeleteSiteDialog, setShowDeleteSiteDialog] = useState(false);
  const [showDeleteProxyDialog, setShowDeleteProxyDialog] = useState(false);
  const [deletingSite, setDeletingSite] = useState<SiteConfig | null>(null);
  const [deletingProxy, setDeletingProxy] = useState<ProxyConfig | null>(null);

  const handleLaunchSite = async (site: SiteConfig) => {
    try {
      console.log("Launching site:", site);
      await TauriAPI.launchSite(site.id);
    } catch (error) {
      console.error("Failed to launch site:", error);
    }
  };

  const handleEditSite = (site: SiteConfig) => {
    setEditingSite(site);
    setSiteDialogMode("edit");
    setShowSiteDialog(true);
  };

  const handleDeleteSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      setDeletingSite(site);
      setShowDeleteSiteDialog(true);
    }
  };

  const confirmDeleteSite = async () => {
    if (!settings || !deletingSite) return;

    const updatedSettings = {
      ...settings,
      sites: settings.sites.filter((s) => s.id !== deletingSite.id),
    };

    try {
      await saveSettingsMutation.mutateAsync(updatedSettings);
      console.log("Site deleted successfully");
      setDeletingSite(null);
    } catch (error) {
      console.error("Failed to delete site:", error);
      alert("Failed to delete site, please try again later");
    }
  };

  const handleLaunchProxy = async (proxy: ProxyConfig) => {
    try {
      await TauriAPI.launchProxy(proxy.id);
    } catch (error) {
      console.error("Failed to launch proxy:", error);
      alert("Failed to launch proxy, please try again later");
    }
  };

  const handleEditProxy = (proxy: ProxyConfig) => {
    setEditingProxy(proxy);
    setProxyDialogMode("edit");
    setShowProxyDialog(true);
  };

  const handleDeleteProxy = (proxyId: string) => {
    const proxy = proxies.find((p) => p.id === proxyId);
    if (proxy) {
      setDeletingProxy(proxy);
      setShowDeleteProxyDialog(true);
    }
  };

  const confirmDeleteProxy = async () => {
    if (!settings || !deletingProxy) return;

    const updatedSettings = {
      ...settings,
      proxies: settings.proxies.filter((p) => p.id !== deletingProxy.id),
    };

    try {
      await saveSettingsMutation.mutateAsync(updatedSettings);
      console.log("Proxy deleted successfully");
      setDeletingProxy(null);
    } catch (error) {
      console.error("Failed to delete proxy:", error);
      alert("Failed to delete proxy, please try again later");
    }
  };

  const handleAddProxy = () => {
    setEditingProxy(null);
    setProxyDialogMode("add");
    setShowProxyDialog(true);
  };

  const handleSaveProxy = async (
    proxyId: string | undefined,
    proxyData: Omit<ProxyConfig, "id">
  ) => {
    if (!settings) return;

    let updatedSettings;

    if (proxyId) {
      // Edit existing proxy
      updatedSettings = {
        ...settings,
        proxies: settings.proxies.map((proxy) =>
          proxy.id === proxyId ? { ...proxyData, id: proxyId } : proxy
        ),
      };
    } else {
      // Add new proxy
      const newProxy: ProxyConfig = {
        ...proxyData,
        id: Date.now().toString(),
      };
      updatedSettings = {
        ...settings,
        proxies: [...settings.proxies, newProxy],
      };
    }

    try {
      console.log("Attempting to save settings:", updatedSettings);
      await saveSettingsMutation.mutateAsync(updatedSettings);
      console.log(
        proxyId ? "Proxy updated successfully" : "Proxy added successfully"
      );
      setEditingProxy(null);
    } catch (error) {
      console.error(`Failed to ${proxyId ? "update" : "add"} proxy:`, error);
      alert(`Failed to ${proxyId ? "update" : "add"} proxy, please try again later`);
    }
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setSiteDialogMode("add");
    setShowSiteDialog(true);
  };

  const handleSaveSite = async (
    siteId: string | undefined,
    siteData: Omit<SiteConfig, "id">
  ) => {
    if (!settings) return;

    let updatedSettings;

    if (siteId) {
      // Edit existing site
      updatedSettings = {
        ...settings,
        sites: settings.sites.map((site) =>
          site.id === siteId ? { ...siteData, id: siteId } : site
        ),
      };
    } else {
      // Add new site
      const newSite: SiteConfig = {
        ...siteData,
        id: Date.now().toString(),
      };
      updatedSettings = {
        ...settings,
        sites: [...settings.sites, newSite],
      };
    }

    try {
      console.log("Attempting to save site settings:", updatedSettings);
      await saveSettingsMutation.mutateAsync(updatedSettings);
      console.log(
        siteId ? "Site updated successfully" : "Site added successfully"
      );
      setEditingSite(null);
    } catch (error) {
      console.error(`Failed to ${siteId ? "update" : "add"} site:`, error);
      alert(`Failed to ${siteId ? "update" : "add"} site, please try again later`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Loading error:", error);
    // Continue with fallback behavior instead of showing error screen
  }

  return (
    <TrayManager>
      <div className="min-h-screen bg-background">
        <Header
          onSettingsClick={() => router.push("/settings")}
          onAboutClick={() => router.push("/about")}
        />

        <div className="container mx-auto px-6 pb-6 space-y-6 max-w-4xl">
          {/* Sites Section */}
          <SitesList
            sites={sites}
            browsers={browsers}
            proxies={proxies}
            onLaunch={handleLaunchSite}
            onEdit={handleEditSite}
            onDelete={handleDeleteSite}
            onAddSite={handleAddSite}
          />

          {/* Proxy Management Section */}
          <ProxyList
            proxies={proxies}
            onLaunch={handleLaunchProxy}
            onEdit={handleEditProxy}
            onDelete={handleDeleteProxy}
            onAddProxy={handleAddProxy}
          />

          {/* Empty State */}
          {sites.length === 0 && proxies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <p>Welcome to Browser Proxy Launcher!</p>
                <p className="text-sm">
                  Add some sites and proxies to get started.
                </p>
              </div>
            </div>
          )}
        </div>

        <SiteDialog
          open={showSiteDialog}
          onOpenChange={setShowSiteDialog}
          mode={siteDialogMode}
          site={editingSite || undefined}
          onSave={handleSaveSite}
          proxies={proxies}
          browsers={browsers}
          defaultBrowser={settings?.default_browser}
        />

        <ProxyDialog
          open={showProxyDialog}
          onOpenChange={setShowProxyDialog}
          mode={proxyDialogMode}
          proxy={editingProxy || undefined}
          onSave={handleSaveProxy}
        />

        <ConfirmDialog
          open={showDeleteSiteDialog}
          onOpenChange={(open) => {
            setShowDeleteSiteDialog(open);
            if (!open) {
              setDeletingSite(null);
            }
          }}
          title="Delete Site"
          description={`Are you sure you want to delete "${deletingSite?.name}" site? This action cannot be undone.`}
          onConfirm={confirmDeleteSite}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />

        <ConfirmDialog
          open={showDeleteProxyDialog}
          onOpenChange={(open) => {
            setShowDeleteProxyDialog(open);
            if (!open) {
              setDeletingProxy(null);
            }
          }}
          title="Delete Proxy"
          description={`Are you sure you want to delete "${deletingProxy?.name}" proxy? This action cannot be undone.`}
          onConfirm={confirmDeleteProxy}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </TrayManager>
  );
}
