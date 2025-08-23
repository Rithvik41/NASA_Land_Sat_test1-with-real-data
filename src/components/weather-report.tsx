
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import type { WeatherData, HourlyForecast } from "@/lib/types";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

interface WeatherReportProps {
    weather: WeatherData | null;
    isLoading?: boolean;
    showForecast?: boolean;
    onFetchWeather?: () => void;
}

// A type guard to check if a string is a valid Lucide icon name
function isValidIcon(name: string): name is keyof typeof LucideIcons {
  return name in LucideIcons;
}

const Icon = ({ name, ...props }: {name: string, [key: string]: any}) => {
    const IconComponent = isValidIcon(name) ? LucideIcons[name] : LucideIcons.CloudQuestion;
    return <IconComponent {...props} />;
}

export function WeatherReport({ weather, isLoading, showForecast = true, onFetchWeather }: WeatherReportProps) {
  if (isLoading) {
    return <Skeleton className="h-full w-full min-h-[160px]" />;
  }

  if (!weather) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[160px]">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">No weather data.</p>
           {onFetchWeather && (
             <Button onClick={onFetchWeather} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Fetch Weather
            </Button>
           )}
        </CardContent>
      </Card>
    );
  }

  const { current, forecast, summary } = weather;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Weather</CardTitle>
        <CardDescription>{showForecast ? summary : current.conditions}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <Icon name={current.iconName} className="h-12 w-12 text-primary" />
                <div>
                     <div className="text-4xl font-bold">{current.temperature.toFixed(0)}°C</div>
                </div>
            </div>
            <div className="space-y-2 text-sm text-right">
                <div className="flex justify-end gap-2">
                    <span className="text-muted-foreground">Humidity</span>
                    <span className="font-semibold">{current.humidity}%</span>
                </div>
                <div className="flex justify-end gap-2">
                    <span className="text-muted-foreground">Wind</span>
                    <span className="font-semibold">{current.windSpeed} km/h</span>
                </div>
            </div>
        </div>

        {showForecast && (
            <>
                <h4 className="font-semibold mb-2">Hourly Forecast</h4>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 pb-4">
                    {forecast.map((hour: HourlyForecast) => (
                        <div key={hour.time} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 min-w-[80px]">
                            <p className="text-sm font-medium">{hour.time}</p>
                            <Icon name={hour.iconName} className="h-8 w-8 text-muted-foreground" />
                            <p className="text-lg font-bold">{hour.temperature.toFixed(0)}°C</p>
                        </div>
                    ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </>
        )}
      </CardContent>
    </Card>
  );
}
