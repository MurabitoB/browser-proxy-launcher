"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function About() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground">About</h1>
        </div>

        <div className="space-y-6">
          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                Browser Proxy Launcher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Version</h3>
                <p className="text-muted-foreground">v0.1.4</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-foreground">
                  Description
                </h3>
                <p className="text-muted-foreground">
                  A desktop application for easily launching browsers with proxy
                  configurations. Manage multiple proxies, save your sites, and
                  launch them with different browsers and proxy settings with
                  just one click.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Multiple browser support (Chrome, Edge)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  HTTP, SOCKS5, and PAC proxy support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Sites management with proxy binding
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Dark/Light theme support
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Built With</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <span>Next.js</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <span>React</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-orange-500" />
                  <span>Tauri</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                  <span>TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-teal-500" />
                  <span>Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-orange-600" />
                  <span>Rust</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
