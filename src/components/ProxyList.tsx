import { ProxyConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Plus, Edit, Trash2, Rocket } from "lucide-react";

interface ProxyListProps {
  proxies: ProxyConfig[];
  onLaunch: (proxy: ProxyConfig) => void;
  onEdit: (proxy: ProxyConfig) => void;
  onDelete: (proxyId: string) => void;
  onAddProxy: () => void;
}

export function ProxyList({
  proxies,
  onLaunch,
  onEdit,
  onDelete,
  onAddProxy,
}: ProxyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Proxy Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {proxies.map((proxy) => (
            <div
              key={proxy.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{proxy.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {proxy.proxy_type === "pac"
                    ? `PAC: ${proxy.url || "No URL configured"}`
                    : `${proxy.proxy_type.toUpperCase()}://${proxy.host}:${
                        proxy.port
                      }`}
                  {proxy.username && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Auth
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(proxy)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(proxy.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => onLaunch(proxy)}>
                  <Rocket className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onAddProxy}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Proxy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
