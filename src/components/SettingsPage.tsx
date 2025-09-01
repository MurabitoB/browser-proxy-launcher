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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { TauriAPI } from "@/lib/tauri-api";
import { useSettingsPath } from "@/hooks/useSettings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const settingsFormSchema = z.object({
  default_browser: z.string().min(1, "Please select a browser"),
  default_launch_url: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal("")),
  ignore_cert_errors: z.boolean(),
  launch_on_startup: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

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
  const [currentBrowsers, setCurrentBrowsers] = useState(browsers);
  const { theme, setTheme } = useTheme();
  const { data: settingsPath } = useSettingsPath();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      default_browser: settings.default_browser || "",
      default_launch_url: settings.default_launch_url || "",
      ignore_cert_errors: settings.ignore_cert_errors || false,
      launch_on_startup: settings.launch_on_startup || false,
    },
  });


  // Update form values when settings prop changes
  useEffect(() => {
    form.reset({
      default_browser: settings.default_browser || "",
      default_launch_url: settings.default_launch_url || "",
      ignore_cert_errors: settings.ignore_cert_errors || false,
      launch_on_startup: settings.launch_on_startup || false,
    });
  }, [settings, form]);

  // Update browsers list when prop changes
  useEffect(() => {
    setCurrentBrowsers(browsers);
  }, [browsers]);

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
        // Update form with imported settings
        form.reset({
          default_browser: importedSettings.default_browser || "",
          default_launch_url: importedSettings.default_launch_url || "",
          ignore_cert_errors: importedSettings.ignore_cert_errors || false,
          launch_on_startup: importedSettings.launch_on_startup || false,
        });
        // Also need to reload browser list
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

  const onSubmit = (values: SettingsFormValues) => {
    const updatedSettings: AppSettings = {
      ...settings,
      ...values,
      // Keep other fields that aren't in the form
      sites: settings.sites,
      proxies: settings.proxies,
      browsers: settings.browsers,
    };
    onSave(updatedSettings);
  };

  const handleCancel = () => {
    form.reset(); // Reset form to original values
    onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Browser Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Browser Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="default_browser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Default Browser
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a browser" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currentBrowsers.map((browser) => (
                            <SelectItem key={browser.id} value={browser.id}>
                              {browser.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <Input
                          value={browser.path}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          type="button"
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

                <FormField
                  control={form.control}
                  name="default_launch_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Default Launch URL for Proxy Testing
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.google.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        This URL will be opened when testing proxies. Leave
                        empty to open browser home page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ignore_cert_errors"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center space-x-4 space-y-0">
                      <FormControl>
                        <Switch checked={value} onCheckedChange={onChange} />
                      </FormControl>
                      <FormLabel className="ml-2 text-sm text-foreground">
                        Ignore certificate errors
                      </FormLabel>
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="launch_on_startup"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex flex-row items-center space-y-0">
                      <FormControl>
                        <Switch checked={value} onCheckedChange={onChange} />
                      </FormControl>
                      <FormLabel className="ml-2 text-sm text-foreground">
                        Launch on system startup
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleExportSettings}>
                    Export
                  </Button>
                  <Button type="button" variant="outline" onClick={handleImportSettings}>
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
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
