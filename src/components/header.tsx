
import Link from "next/link";
import { Mountain, LayoutDashboard, BarChart3, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <Mountain className="h-6 w-6 mr-2" />
            <span className="font-bold">Earth Insights</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
            <Button variant="ghost" asChild>
                <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4"/>
                    Dashboard
                </Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/visualizations">
                    <BarChart3 className="mr-2 h-4 w-4"/>
                    Visualizations
                </Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4"/>
                    Settings
                </Link>
            </Button>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
