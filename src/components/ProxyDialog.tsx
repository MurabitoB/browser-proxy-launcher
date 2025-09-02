"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { ProxyConfig } from "@/types";

const proxyFormSchema = z
  .object({
    name: z.string().min(1, "Proxy name is required").trim(),
    type: z.enum(["http", "socks5", "pac"]),
    host: z.string().optional(),
    port: z
      .number()
      .min(1, "Port must be between 1-65535")
      .max(65535, "Port must be between 1-65535")
      .optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    url: z.string().optional(),
  })
  .refine(
    (data) => {
      // PAC type requires URL
      if (data.type === "pac") {
        return data.url && data.url.trim().length > 0;
      }
      // Non-PAC types require host and port
      return data.host && data.host.trim().length > 0 && data.port;
    },
    {
      message: "PAC type requires URL, other types require host and port",
      path: ["url"],
    }
  );

type ProxyFormValues = z.infer<typeof proxyFormSchema>;

interface ProxyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  proxy?: ProxyConfig; // Proxy configuration passed when editing
  onSave: (proxyId: string | undefined, proxy: Omit<ProxyConfig, "id">) => void;
}

export function ProxyDialog({
  open,
  onOpenChange,
  mode,
  proxy,
  onSave,
}: ProxyDialogProps) {
  const form = useForm<ProxyFormValues>({
    resolver: zodResolver(proxyFormSchema),
    defaultValues: {
      name: "",
      type: "http",
      host: "",
      port: 8080,
      username: "",
      password: "",
      url: "",
    },
  });

  const selectedType = form.watch("type");

  // Set form initial values when dialog opens and has proxy data
  useEffect(() => {
    if (open && mode === "edit" && proxy) {
      form.reset({
        name: proxy.name,
        type: proxy.proxy_type,
        host: proxy.host,
        port: proxy.port || 1,
        username: proxy.username || "",
        password: proxy.password || "",
        url: proxy.url || "",
      });
    } else if (open && mode === "add") {
      form.reset({
        name: "",
        type: "http",
        host: "",
        port: 8080,
        username: "",
        password: "",
        url: "",
      });
    }
  }, [open, mode, proxy, form]);

  const onSubmit = (values: ProxyFormValues) => {
    const proxyData: Omit<ProxyConfig, "id"> = {
      name: values.name,
      proxy_type: values.type,
      host: values.type === "pac" ? "" : values.host || "", // PAC type doesn't need host
      port: values.type === "pac" ? 0 : values.port || 8080, // PAC type doesn't need port
      username: values.username || undefined,
      password: values.password || undefined,
      ...(values.type === "pac" && values.url ? { url: values.url } : {}), // PAC type needs url
    };

    onSave(proxy?.id, proxyData);
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const isEditMode = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {isEditMode ? "Edit Proxy" : "Add Proxy"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isEditMode
                  ? "Update the proxy configuration."
                  : "Create a new proxy configuration for site access."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Proxy Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Local Proxy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear port and host when switching to PAC type
                          if (value === "pac") {
                            form.setValue("port", undefined);
                            form.setValue("host", "");
                          } else if (!form.getValues("port")) {
                            form.setValue("port", 8080);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="socks5">SOCKS5</SelectItem>
                          <SelectItem value="pac">PAC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType !== "pac" && (
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="8080"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 8080)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {selectedType === "pac" ? (
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">PAC URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="http://example.com/proxy.pac"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        URL to the PAC (Proxy Auto-Configuration) file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Host</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="127.0.0.1 or proxy.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        Optional authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Optional"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground">
                        Optional authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update Proxy" : "Add Proxy"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
