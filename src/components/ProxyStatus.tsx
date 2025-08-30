import { ProxyStatus as ProxyStatusType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Circle } from "lucide-react";

interface ProxyStatusProps {
  status: ProxyStatusType;
}

export function ProxyStatus({ status }: ProxyStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Proxy Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active:</span>
          <Badge variant={status.active > 0 ? "success" : "secondary"}>
            <Circle className="h-2 w-2 mr-1 fill-current" />
            {status.active}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available:</span>
          <Badge variant="outline">
            <Circle className="h-2 w-2 mr-1" />
            {status.configured}
          </Badge>
        </div>
        {status.lastTested && (
          <div className="text-xs text-muted-foreground">
            Last tested: {new Date(status.lastTested).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
