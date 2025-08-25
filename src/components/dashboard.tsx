
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
import type { MetricData, GroundTruthDataPoint, SatellitePassData, WeatherData, HistoryEntry, EEMetrics } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { predictSatellitePassAction, getWeatherReportAction } from "@/lib/actions";

const transformEEMetricsToMetricData = (eeMetrics: EEMetrics, dateRange: DateRange): MetricData[] => {
    // Since EE provides a single composite value, we can represent it as a flat line
    // or as a two-point series for change calculation. For simplicity, we'll create a basic structure.
    // A real implementation would fetch a time-series from EE.
    const createMetric = (name: string, value: number | null): MetricData => ({
        name,
        timeSeries: [
            { date: (dateRange.from as Date).toISOString(), value: value || 0 },
            { date: (dateRange.to as Date).toISOString(), value: value || 0 }
        ],
        firstValue: value,
        lastValue: value,
        percentageChange: 0,
        n: value !== null ? 1 : 0
    });

    return [
        createMetric('NDVI', eeMetrics.NDVI),
        createMetric('NDBI', eeMetrics.NDBI),
        createMetric('NDWI', eeMetrics.NDWI),
        createMetric('NBR', eeMetrics.NBR),
        createMetric('MNDWI', eeMetrics.MNDWI),
        createMetric('SWIR_RATIO', eeMetrics.SWIR_RATIO),
    ];
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
  const [activeComputation, setActiveComputation] = useState(false);

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
          icon: "/favicon.ico",
        });
      }, delay);

      return () => clearTimeout(timerId);
    }
  }, [nextPass, lat, lon, notificationsEnabled]);


  const fetchNextPass = useCallback(async () => {
      if (!lat || !lon) {
           toast({ title: "Coordinates missing", description: "Please enter latitude and longitude.", variant: "destructive" });
           return;
      }
      setIsFetchingPass(true);
      const result = await predictSatellitePassAction({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      if (result.error) {
          toast({ title: "Error", description: result.error, variant: "destructive" });
          setNextPass(null);
      } else if (result.data) {
          setNextPass(result.data);
      }
      setIsFetchingPass(false);
  }, [lat, lon, toast]);

  const fetchWeather = useCallback(async () => {
    if (!lat || !lon) {
        toast({ title: "Coordinates missing", description: "Please enter latitude and longitude.", variant: "destructive" });
        return;
    }
    setIsFetchingWeather(true);
    const result = await getWeatherReportAction({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
    if (result.error) {
      toast({ title: "AI Error", description: result.error, variant: "destructive" });
      setWeather(null);
    } else if (result.data) {
      setWeather(result.data);
    }
    setIsFetchingWeather(false);
  }, [lat, lon, toast]);
  
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
    setActiveComputation(true);
    setMetrics([]);
    setNextPass(null);
    setWeather(null);
    
    const newHistoryEntry: HistoryEntry = {
      id: new Date().toISOString(),
      lat,
      lon,
      locationDesc,
      dateRange,
      timestamp: new Date(),
    };
    setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]);

    try {
        const params = new URLSearchParams({
            lat,
            lon,
            start: format(dateRange.from, 'yyyy-MM-dd'),
            end: format(dateRange.to, 'yyyy-MM-dd'),
            collection: 'landsat8'
        });
        
        const response = await fetch(`/api/earthengine/metrics?${params.toString()}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch metrics: ${response.statusText}`);
        }
        
        const eeMetrics: EEMetrics = await response.json();
        const data = transformEEMetricsToMetricData(eeMetrics, dateRange);

        // Add ground truth data if available
        const ndviMetric = data.find(m => m.name === 'NDVI');
        if (ndviMetric && groundTruthData) {
            ndviMetric.groundTruth = groundTruthData;
        }

        setMetrics(data);
        setSelectedMetric('NDVI');
        toast({ title: "Success", description: "Metrics computed successfully from Google Earth Engine." });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Computation Error", description: errorMessage, variant: "destructive" });
    } finally {
        setIsComputing(false);
    }
  }, [lat, lon, locationDesc, dateRange, groundTruthData, toast]);
  

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
      
      {!activeComputation && (
          <div className="text-center py-16 text-muted-foreground">
              <p>Enter coordinates and click "Compute Metrics" to get started.</p>
          </div>
      )}

      {activeComputation && metrics.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <SummaryCards 
                metrics={metrics} 
                nextPass={nextPass}
                isFetchingPass={isFetchingPass}
                onFetchPass={fetchNextPass}
              />
            </div>
            <div className="lg:col-span-1">
                <WeatherReport 
                    weather={weather} 
                    isLoading={isFetchingWeather} 
                    showForecast={false}
                    onFetchWeather={fetchWeather}
                />
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
