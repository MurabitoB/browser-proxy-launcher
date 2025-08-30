import { FavoriteConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Plus, ExternalLink } from "lucide-react";

interface FavoritesListProps {
  favorites: FavoriteConfig[];
  onLaunch: (favorite: FavoriteConfig) => void;
  onAddFavorite: () => void;
}

export function FavoritesList({
  favorites,
  onLaunch,
  onAddFavorite,
}: FavoritesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{favorite.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {favorite.browser.icon} {favorite.browser.name}
                  </span>
                  {favorite.proxyId && (
                    <Badge variant="outline" className="text-xs">
                      Proxy
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onLaunch(favorite)}
                className="ml-4"
              >
                <Rocket className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onAddFavorite}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Favorite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
