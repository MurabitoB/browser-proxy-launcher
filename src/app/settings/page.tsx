"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsPage } from "@/components/SettingsPage";
import { mockBrowsers, mockSettings } from "@/lib/mock-data";
import { AppSettings } from "@/types";

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(mockSettings);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    console.log("Settings saved:", newSettings);
    // TODO: 實際保存設置到後端或本地存儲
    router.push("/");
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <SettingsPage
      settings={settings}
      browsers={mockBrowsers}
      onBack={handleBack}
      onSave={handleSaveSettings}
    />
  );
}
