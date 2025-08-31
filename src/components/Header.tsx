import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  onAboutClick: () => void;
}

export function Header({ onSettingsClick, onAboutClick }: HeaderProps) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="text-foreground"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAboutClick}
            className="text-foreground"
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
        </div>
      </div>
    </div>
  );
}
