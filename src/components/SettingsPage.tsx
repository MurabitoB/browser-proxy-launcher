import { AppSettings, Browser } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Folder } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsPageProps {
  settings: AppSettings;
  browsers: Browser[];
  onBack: () => void;
  onSave: (settings: AppSettings) => void;
}

export function SettingsPage({
  settings,
  browsers,
  onBack,
  onSave,
}: SettingsPageProps) {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    onSave(currentSettings);
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setCurrentSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 p-6 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
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
              <label className="text-sm font-medium mb-2 block">
                Default Browser:
              </label>
              <Select
                value={currentSettings.defaultBrowser}
                onValueChange={(value) =>
                  updateSetting("defaultBrowser", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a browser" />
                </SelectTrigger>
                <SelectContent>
                  {browsers.map((browser) => (
                    <SelectItem key={browser.id} value={browser.id}>
                      {browser.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Browser Paths:
              </label>
              <div className="space-y-3">
                {browsers.map((browser) => (
                  <div key={browser.id} className="flex items-center gap-2">
                    <span className="w-16 text-sm">{browser.name}:</span>
                    <Input value={browser.path} readOnly className="flex-1" />
                    <Button variant="outline" size="sm">
                      <Folder className="h-4 w-4 mr-2" />
                      Browse...
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="autoDetect" defaultChecked />
              <label htmlFor="autoDetect" className="text-sm">
                Auto-detect browser installations
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Proxy Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Proxy Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Switch
                id="autoTest"
                checked={currentSettings.autoTestProxies}
                onCheckedChange={(checked) =>
                  updateSetting("autoTestProxies", checked)
                }
              />
              <label htmlFor="autoTest" className="text-sm">
                Auto-test proxies on startup
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme:</label>
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
                  id="launchStartup"
                  checked={currentSettings.launchOnStartup}
                  onCheckedChange={(checked) =>
                    updateSetting("launchOnStartup", checked)
                  }
                />
                <label htmlFor="launchStartup" className="text-sm">
                  Launch on system startup
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="minimizeTray"
                  checked={currentSettings.minimizeToTray}
                  onCheckedChange={(checked) =>
                    updateSetting("minimizeToTray", checked)
                  }
                />
                <label htmlFor="minimizeTray" className="text-sm">
                  Minimize to system tray
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="closeTray"
                  checked={currentSettings.closeToTray}
                  onCheckedChange={(checked) =>
                    updateSetting("closeToTray", checked)
                  }
                />
                <label htmlFor="closeTray" className="text-sm">
                  Close to system tray
                </label>
              </div>
            </div>


            <div>
              <label className="text-sm font-medium mb-2 block">
                Max recent items:
              </label>
              <Input
                type="number"
                value={currentSettings.maxRecentItems}
                onChange={(e) =>
                  updateSetting("maxRecentItems", parseInt(e.target.value))
                }
                className="w-20"
              />
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
              <Button variant="outline">Export Settings...</Button>
              <Button variant="outline">Import Settings...</Button>
              <Button variant="outline">Reset to Defaults...</Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Storage Location:
              </label>
              <div className="text-sm text-muted-foreground font-mono p-2 bg-muted rounded">
                ~/.browser-proxy-launcher/
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
