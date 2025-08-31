"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SettingsPage } from "@/components/SettingsPage";
import { AppSettings } from "@/types";
import { useBrowsers } from "@/hooks/useBrowsers";
import { useSettings, useSaveSettings } from "@/hooks/useSettings";

export default function Settings() {
  const router = useRouter();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const {
    data: browsers = [],
    isLoading: browsersLoading,
    error: browsersError,
  } = useBrowsers();
  const {
    data: serverSettings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const saveSettingsMutation = useSaveSettings();

  // Update local settings when server settings are loaded
  useEffect(() => {
    if (serverSettings) {
      setLocalSettings(serverSettings);
    }
  }, [serverSettings]);

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      console.log("Settings page: attempting to save settings:", newSettings);
      await saveSettingsMutation.mutateAsync(newSettings);
      setLocalSettings(newSettings);
      console.log("Settings saved successfully");
      router.push("/");
    } catch (error) {
      console.error("Failed to save settings:", error);
      // TODO: Show error message to user
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const isLoading = browsersLoading || settingsLoading || !localSettings;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Detecting browsers...</p>
        </div>
      </div>
    );
  }

  if (browsersError || settingsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Failed to load settings</div>
          <p className="text-muted-foreground">
            {browsersError?.message || settingsError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SettingsPage
      settings={localSettings!}
      browsers={browsers}
      onBack={handleBack}
      onSave={handleSaveSettings}
    />
  );
}
