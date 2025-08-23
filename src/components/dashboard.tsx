
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { InputPanel } from "@/components/input-panel";
import { SummaryCards } from "@/components/summary-cards";
import { MetricsTable } from "@/components/metrics-table";
import { Visualizations } from "@/components/visualizations";
import { WeatherReport } from "@/components/weather-report";
import { useToast } from "@/hooks/use-toast";
import type { MetricData, GroundTruthDataPoint, SatellitePassData, WeatherData, HistoryEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { predictSatellitePassAction, getWeatherReportAction } from "@/lib/actions";

// Mock data generation
const metricNames = [
  'NDVI', 'NDBI', 'NDWI', 'NBR', 'MNDWI', 'Yield Index', 'Soil Moisture Percent', 'Water Percent', 'SWIR Ratio',
  'Vegetation Area', 'Built-up Area', 'Water Area', 'Other Area',
  'Vegetation Area Change', 'Built-up Area Change', 'Water Area Change', 'Other Area Change',
  'Built-up Expansion', 'Vegetation Loss'
];

function generateMockMetricData(dateRange: DateRange, groundTruth?: GroundTruthDataPoint[]): MetricData[] {
  const from = dateRange.from || new Date();
  const to = dateRange.to || new Date();
  const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

  return metricNames.map(name => {
    let baseValue = Math.random() * 2 - 1;
    if (name.includes('Percent') || name === 'Yield Index') {
        baseValue = Math.random() * 100;
    }
    if (name.includes('Area')) {
        baseValue = Math.random() * 1000;
    }
     if (name.includes('Change') || name.includes('Expansion') || name.includes('Loss')) {
        baseValue = (Math.random() - 0.5) * 200;
    }


    const timeSeries = Array.from({ length: diffDays }, (_, i) => {
      const date = addDays(from, i);
      let value = baseValue + (Math.random() - 0.5) * 0.1 * (i / diffDays);
       if (name.includes('Change') || name.includes('Expansion') || name.includes('Loss')) {
        value = baseValue + (Math.random() - 0.5) * 10 * (i/diffDays);
       }
      return { date: date.toISOString(), value };
    });

    const validPoints = timeSeries.filter(d => d.value !== null && !isNaN(d.value));
    const firstValue = validPoints.length > 0 ? validPoints[0].value : null;
    const lastValue = validPoints.length > 0 ? validPoints[validPoints.length - 1].value : null;
    
    let percentageChange: number | null = null;
    if (firstValue !== null && lastValue !== null && firstValue !== 0) {
        if(name.includes('Change') || name.includes('Expansion') || name.includes('Loss')) {
            percentageChange = lastValue; // For change metrics, this might represent the final change percentage
        } else {
             percentageChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
        }
    }
    
    return {
      name,
      timeSeries,
      firstValue,
      lastValue,
      percentageChange,
      n: validPoints.length,
      groundTruth: name === 'NDVI' ? groundTruth : undefined, // Only attach ground truth to NDVI for demo
    };
  });
}

export function Dashboard() {
  const { toast } = useToast();
  const [lat, setLat] = useState("40.7128");
  const [lon, setLon] = useState("-74.0060");
  const [locationDesc, setLocationDesc] = useState("New York City");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -365),
    to: new Date(),
  });
  const [groundTruthData, setGroundTruthData] = useState<GroundTruthDataPoint[] | null>(null);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>("NDVI");
  const [nextPass, setNextPass] = useState<SatellitePassData | null>(null);
  const [isFetchingPass, setIsFetchingPass] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!nextPass || !notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const passTime = new Date(nextPass.passTime);
    const now = new Date();
    // Notify 1 minute before the pass
    const notificationTime = passTime.getTime() - 60000; 
    const delay = notificationTime - now.getTime();

    if (delay > 0) {
      const timerId = setTimeout(() => {
        new Notification("Satellite Alert", {
          body: `Satellite ${nextPass.satelliteName} will pass over your selected location (${lat}, ${lon}) in 1 minute.`,
          icon: "/favicon.ico", // Optional: add an icon
        });
      }, delay);

      return () => clearTimeout(timerId);
    }
  }, [nextPass, lat, lon, notificationsEnabled]);


  const fetchNextPass = useCallback(async (latitude: string, longitude: string) => {
      if (!latitude || !longitude) return;
      setIsFetchingPass(true);
      const result = await predictSatellitePassAction({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
      if (result.error) {
          toast({ title: "AI Error", description: result.error, variant: "destructive" });
          setNextPass(null);
      } else if (result.data) {
          setNextPass(result.data);
      }
      setIsFetchingPass(false);
  }, [toast]);

  const fetchWeather = useCallback(async (latitude: string, longitude: string) => {
    if (!latitude || !longitude) return;
    setIsFetchingWeather(true);
    const result = await getWeatherReportAction({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
    if (result.error) {
      toast({ title: "AI Error", description: result.error, variant: "destructive" });
      setWeather(null);
    } else if (result.data) {
      setWeather(result.data);
    }
    setIsFetchingWeather(false);
  }, [toast]);
  
  const handleHistorySelect = (entry: HistoryEntry) => {
    setLat(entry.lat);
    setLon(entry.lon);
    setLocationDesc(entry.locationDesc);
    setDateRange(entry.dateRange);
    toast({ title: "Loaded from history", description: `Loaded settings for ${entry.locationDesc}`});
  };

  const handleCompute = useCallback(async () => {
    if (!lat || !lon) {
      toast({ title: "Error", description: "Please provide valid latitude and longitude.", variant: "destructive" });
      return;
    }
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast({ title: "Error", description: "Please select a valid date range.", variant: "destructive" });
      return;
    }

    setIsComputing(true);
    setMetrics([]);
    setNextPass(null);
    setWeather(null);

    // Stagger AI calls
    await fetchNextPass(lat, lon);
    await new Promise(resolve => setTimeout(resolve, 500)); // Short delay
    await fetchWeather(lat, lon);
    
    const newHistoryEntry: HistoryEntry = {
      id: new Date().toISOString(),
      lat,
      lon,
      locationDesc,
      dateRange,
      timestamp: new Date(),
    };
    setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]); // Keep last 10 entries


    setTimeout(() => {
      const mockData = generateMockMetricData(dateRange, groundTruthData || undefined);
      setMetrics(mockData);
      setSelectedMetric('NDVI'); // Reset to default metric on new computation
      setIsComputing(false);
      toast({ title: "Success", description: "Metrics computed successfully." });
    }, 1000);
  }, [lat, lon, locationDesc, dateRange, groundTruthData, toast, fetchNextPass, fetchWeather]);
  

  const onMetricsUpdate = (updatedMetrics: MetricData[]) => {
    setMetrics(updatedMetrics);
  }
  
  const dateRangeString = dateRange?.from && dateRange?.to 
    ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
    : "N/A";

  return (
    <div className="container mx-auto p-4 space-y-6">
      <InputPanel
        lat={lat}
        setLat={setLat}
        lon={lon}
        setLon={setLon}
        locationDesc={locationDesc}
        setLocationDesc={setLocationDesc}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onCompute={handleCompute}
        isComputing={isComputing}
        onFileUpload={setGroundTruthData}
        history={history}
        onHistorySelect={handleHistorySelect}
      />

      {(isComputing && metrics.length === 0) && (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
      )}
      
      {!isComputing && metrics.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
              <p>Enter coordinates and click "Compute Metrics" to get started.</p>
          </div>
      )}

      {metrics.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <SummaryCards 
                metrics={metrics} 
                nextPass={nextPass}
                isFetchingPass={isFetchingPass}
              />
            </div>
            <div className="lg:col-span-1">
                <WeatherReport weather={weather} isLoading={isFetchingWeather} showForecast={false} />
            </div>
          </div>

          <MetricsTable 
            metrics={metrics} 
            onMetricsUpdate={onMetricsUpdate} 
            location={`${lat}, ${lon}`}
            dateRange={dateRangeString}
          />
          <Visualizations
            metrics={metrics}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
          />
        </>
      )}
    </div>
  );
}
