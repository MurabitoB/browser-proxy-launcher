import { SiteConfig, Browser, ProxyConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Plus, ExternalLink, Edit, Trash2 } from "lucide-react";

interface SitesListProps {
  sites: SiteConfig[];
  browsers: Browser[];
  proxies: ProxyConfig[];
  onLaunch: (site: SiteConfig) => void;
  onEdit: (site: SiteConfig) => void;
  onDelete: (siteId: string) => void;
  onAddSite: () => void;
}

export function SitesList({
  sites,
  browsers,
  proxies,
  onLaunch,
  onEdit,
  onDelete,
  onAddSite,
}: SitesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Web Sites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sites.map((site) => (
            <div
              key={site.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{site.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{site.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {browsers.find((b) => b.id === site.browser_id)?.name ||
                      "Unknown Browser"}
                  </Badge>
                  {site.proxy_id && (
                    <Badge variant="outline" className="text-xs">
                      {proxies.find((p) => p.id === site.proxy_id)?.name ||
                        "Unknown Proxy"}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(site)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(site.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => onLaunch(site)}>
                  <Rocket className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onAddSite}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
