import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  onAboutClick: () => void;
}

export function Header({ onSettingsClick, onAboutClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 border-b">
      <h1 className="text-2xl font-bold text-foreground">
        Browser Proxy Launcher
      </h1>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onSettingsClick}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="ghost" size="sm" onClick={onAboutClick}>
          <Info className="h-4 w-4 mr-2" />
          About
        </Button>
      </div>
    </header>
  );
}
