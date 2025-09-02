"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProxyConfig, Browser, SiteConfig } from "@/types";

const siteFormSchema = z.object({
  name: z.string().min(1, "Site name is required").trim(),
  url: z.string().url("Please enter a valid URL").trim(),
  browserId: z.string().min(1, "Please select a browser"),
  proxyId: z.string(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

interface SiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  site?: SiteConfig;
  onSave: (siteId: string | undefined, site: Omit<SiteConfig, "id">) => void;
  proxies: ProxyConfig[];
  browsers: Browser[];
  defaultBrowser?: string;
}

export function SiteDialog({
  open,
  onOpenChange,
  mode,
  site,
  onSave,
  proxies,
  browsers,
  defaultBrowser,
}: SiteDialogProps) {
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: "",
      url: "",
      browserId: defaultBrowser || browsers[0]?.id || "",
      proxyId: "none",
    },
  });

  // Update form values when mode or site changes
  useEffect(() => {
    if (mode === "edit" && site) {
      form.reset({
        name: site.name,
        url: site.url,
        browserId: site.browser_id,
        proxyId: site.proxy_id || "none",
      });
    } else if (mode === "add") {
      form.reset({
        name: "",
        url: "",
        browserId: defaultBrowser || browsers[0]?.id || "",
        proxyId: "none",
      });
    }
  }, [mode, site, browsers, defaultBrowser, form]);

  const onSubmit = (values: SiteFormValues) => {
    const selectedBrowser = browsers.find((b) => b.id === values.browserId);
    if (!selectedBrowser) {
      form.setError("browserId", { message: "Please select a valid browser" });
      return;
    }

    const siteData: Omit<SiteConfig, "id"> = {
      name: values.name,
      url: values.url,
      browser_id: selectedBrowser.id,
      proxy_id: values.proxyId === "none" ? undefined : values.proxyId,
    };

    onSave(mode === "edit" && site ? site.id : undefined, siteData);
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {isEdit ? "Edit Site" : "Add Site"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isEdit
                  ? "Update the site configuration, browser and proxy settings."
                  : "Create a new site configuration with browser and proxy settings."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Site Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="browserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Browser</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a browser" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {browsers.map((browser) => (
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

              <FormField
                control={form.control}
                name="proxyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Proxy Settings
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No proxy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No proxy</SelectItem>
                        {proxies.map((proxy) => (
                          <SelectItem key={proxy.id} value={proxy.id}>
                            <div>
                              <span className="mr-2"> {proxy.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {proxy.proxy_type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-muted-foreground">
                      Optional proxy configuration for this site.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save Changes" : "Add Site"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
