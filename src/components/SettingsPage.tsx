import { AppSettings, Browser } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Folder } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { TauriAPI } from "@/lib/tauri-api";
import { useSettingsPath } from "@/hooks/useSettings";

interface SettingsPageProps {
  settings: AppSettings;
  browsers: Browser[];
  onBack: () => void;
  onSave: (settings: AppSettings) => void;
  onBrowserPathUpdated?: () => void;
}

export function SettingsPage({
  settings,
  browsers,
  onBack,
  onSave,
  onBrowserPathUpdated,
}: SettingsPageProps) {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [currentBrowsers, setCurrentBrowsers] = useState(browsers);
  const { theme, setTheme } = useTheme();
  const { data: settingsPath } = useSettingsPath();

  const handleBrowseForBrowser = async (browserId: string) => {
    try {
      const selectedPath = await TauriAPI.browseForBrowserExecutable();
      if (selectedPath) {
        // Update the browser path in local state only
        setCurrentBrowsers((prevBrowsers) =>
          prevBrowsers.map((browser) =>
            browser.id === browserId
              ? { ...browser, path: selectedPath }
              : browser
          )
        );

        console.log(`Updated browser ${browserId} path to:`, selectedPath);
      }
    } catch (error) {
      console.error("Failed to browse for browser:", error);
      alert(`Failed to select browser path: ${error}`);
    }
  };

  const handleExportSettings = async () => {
    try {
      const selectedPath = await TauriAPI.browseSaveFile(
        "browser-proxy-settings.json"
      );
      if (selectedPath) {
        await TauriAPI.exportSettings(selectedPath);
        alert(`Settings exported successfully to: ${selectedPath}`);
      }
    } catch (error) {
      console.error("Failed to export settings:", error);
      alert(`Failed to export settings: ${error}`);
    }
  };

  const handleImportSettings = async () => {
    try {
      const selectedPath = await TauriAPI.browseOpenFile(["json"]);
      if (selectedPath) {
        const importedSettings = await TauriAPI.importSettings(selectedPath);
        setCurrentSettings(importedSettings);
        // 也需要重新載入瀏覽器列表
        if (onBrowserPathUpdated) {
          onBrowserPathUpdated();
        }
        alert(`Settings imported successfully from: ${selectedPath}`);
      }
    } catch (error) {
      console.error("Failed to import settings:", error);
      alert(`Failed to import settings: ${error}`);
    }
  };

  const handleSave = () => {
    // Update the settings with current browser paths
    const updatedSettings = {
      ...currentSettings,
      // We don't directly store browser paths in settings, but the save operation
      // will save all current state including browser changes made through the backend
    };
    onSave(updatedSettings);
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setCurrentSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 p-6 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-current" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </header>

      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Browser Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Default Browser:
              </label>
              <Select
                value={currentSettings.default_browser}
                onValueChange={(value) =>
                  updateSetting("default_browser", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a browser" />
                </SelectTrigger>
                <SelectContent>
                  {currentBrowsers.map((browser) => (
                    <SelectItem key={browser.id} value={browser.id}>
                      {browser.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Browser Paths:
              </label>
              <div className="space-y-3">
                {currentBrowsers.map((browser) => (
                  <div key={browser.id} className="flex items-center gap-2">
                    <span className="w-28 text-sm text-foreground">
                      {browser.name}:
                    </span>
                    <Input value={browser.path} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBrowseForBrowser(browser.id)}
                    >
                      <Folder className="h-4 w-4 mr-2 text-current" />
                      Browse
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="autoDetect" defaultChecked />
              <label htmlFor="autoDetect" className="text-sm text-foreground">
                Auto-detect browser installations
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="ignore_cert_errors"
                checked={currentSettings.ignore_cert_errors}
                onCheckedChange={(checked) =>
                  updateSetting("ignore_cert_errors", checked)
                }
              />
              <label
                htmlFor="ignoreCertErrors"
                className="text-sm text-foreground"
              >
                Ignore certificate errors
              </label>
            </div>

            {currentBrowsers.length === 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No browsers detected. Please install Chrome or Edge, or
                  manually configure browser paths.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Theme:
              </label>
              <Select
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as "light" | "dark" | "system")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="launch_on_startup"
                  checked={currentSettings.launch_on_startup}
                  onCheckedChange={(checked) =>
                    updateSetting("launch_on_startup", checked)
                  }
                />
                <label
                  htmlFor="launchStartup"
                  className="text-sm text-foreground"
                >
                  Launch on system startup
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportSettings}>
                Export
              </Button>
              <Button variant="outline" onClick={handleImportSettings}>
                Import
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Storage Location:
              </label>
              <div className="text-sm text-muted-foreground font-mono p-2 bg-muted rounded">
                {settingsPath || "~/.browser-proxy-launcher/"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save/Cancel */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
