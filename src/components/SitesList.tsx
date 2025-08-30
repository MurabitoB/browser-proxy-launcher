import { SiteConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Plus, ExternalLink } from "lucide-react";

interface SitesListProps {
  sites: SiteConfig[];
  onLaunch: (site: SiteConfig) => void;
  onAddSite: () => void;
}

export function SitesList({
  sites,
  onLaunch,
  onAddSite,
}: SitesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sites</CardTitle>
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {site.browser.name}
                  </span>
                  {site.proxyId && (
                    <Badge variant="outline" className="text-xs">
                      Proxy
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onLaunch(site)}
                className="ml-4"
              >
                <Rocket className="h-4 w-4" />
              </Button>
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
