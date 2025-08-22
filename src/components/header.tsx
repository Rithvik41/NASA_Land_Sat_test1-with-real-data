import { Mountain } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton } from "@/components/auth-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Mountain className="h-6 w-6 mr-2" />
          <span className="font-bold">Earth Insights Dashboard</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
