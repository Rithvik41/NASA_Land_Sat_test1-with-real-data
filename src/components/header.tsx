
"use client";

import Link from "next/link";
import { Mountain, LayoutDashboard, BarChart3, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { ContactSheet } from "./contact-sheet";

const scrolltoHash = function (element_id: string) {
  const element = document.getElementById(element_id.replace('#', ''))
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
  }
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const [isContactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const navClass = cn(
    "sticky top-0 z-50 w-full transition-all duration-300",
    isLandingPage && !isScrolled ? "bg-transparent text-white" : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground"
  );
  
  const linkClass = cn(
      "transition-colors",
      isLandingPage && !isScrolled ? "hover:text-gray-200" : "hover:text-foreground/80"
  );
  
  const buttonLinkClass = cn(
    isLandingPage && !isScrolled ? "text-white hover:bg-white/20" : ""
  );

  return (
    <header className={navClass}>
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6" />
            <span className="font-bold text-lg">Earth Insights</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 text-sm font-medium">
             <Button variant="link" asChild className={linkClass}>
                <Link href={isLandingPage ? "#features" : "/#features"} onClick={(e) => {
                    if (isLandingPage) {
                        e.preventDefault();
                        scrolltoHash("#features");
                    }
                }}>
                    Features
                </Link>
            </Button>
            <Button variant="link" asChild className={linkClass}>
                <Link href={isLandingPage ? "#about" : "/#about"} onClick={(e) => {
                     if (isLandingPage) {
                        e.preventDefault();
                        scrolltoHash("#about");
                    }
                }}>
                    About
                </Link>
            </Button>
            <Button variant="link" asChild className={linkClass}>
                <Link href="#contact" onClick={(e) => {
                     e.preventDefault();
                     setContactOpen(true);
                }}>
                    Contact
                </Link>
            </Button>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button variant="ghost" asChild className={buttonLinkClass}>
                <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4"/>
                    Dashboard
                </Link>
            </Button>
             <Button variant="ghost" asChild className={cn(buttonLinkClass, "hidden")}>
                <Link href="/visualizations">
                    <BarChart3 className="mr-2 h-4 w-4"/>
                    Visualizations
                </Link>
            </Button>
             <Button variant="ghost" asChild className={buttonLinkClass}>
                <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4"/>
                    Settings
                </Link>
            </Button>
          <ThemeToggle />
           <Button asChild size="sm" className={cn(!isLandingPage && "hidden")}>
                <Link href="/dashboard">Get Started</Link>
           </Button>
        </div>
      </div>
      <ContactSheet open={isContactOpen} onOpenChange={setContactOpen} />
    </header>
  );
}
