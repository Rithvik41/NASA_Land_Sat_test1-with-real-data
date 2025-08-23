
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import type { WeatherData } from "@/lib/types";

interface WeatherReportProps {
    weather: WeatherData | null;
    isLoading: boolean;
}

// A type guard to check if a string is a valid Lucide icon name
function isValidIcon(name: string): name is keyof typeof LucideIcons {
  return name in LucideIcons;
}

export function WeatherReport({ weather, isLoading }: WeatherReportProps) {
  if (isLoading) {
    return <Skeleton className="h-full w-full min-h-[160px]" />;
  }

  if (!weather) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No weather data available.</p>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = isValidIcon(weather.iconName) ? LucideIcons[weather.iconName] : LucideIcons.CloudQuestion;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Current Weather</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
            <IconComponent className="h-12 w-12 text-primary" />
            <div className="flex-1">
                 <div className="text-4xl font-bold">{weather.temperature.toFixed(0)}°C</div>
                 <p className="text-sm text-muted-foreground">{weather.conditions}</p>
            </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Humidity</span>
                <span>{weather.humidity}%</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Wind</span>
                <span>{weather.windSpeed} km/h</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
