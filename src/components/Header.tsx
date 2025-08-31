import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  onAboutClick: () => void;
}

export function Header({ onSettingsClick, onAboutClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 border-b">
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className="text-foreground"
        >
          <Settings className="h-4 w-4 mr-2 text-current" />
          Settings
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAboutClick}
          className="text-foreground"
        >
          <Info className="h-4 w-4 mr-2 text-current" />
          About
        </Button>
      </div>
    </header>
  );
}
