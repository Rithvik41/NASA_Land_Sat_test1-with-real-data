
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { InputPanel } from "@/components/input-panel";
import { SummaryCards } from "@/components/summary-cards";
import { MetricsTable } from "@/components/metrics-table";
import { Visualizations } from "@/components/visualizations";
import { useToast } from "@/hooks/use-toast";
import type { MetricData, GroundTruthDataPoint, SatellitePassData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { predictSatellitePassAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!nextPass || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const passTime = new Date(nextPass.passTime);
    const now = new Date();
    const notificationTime = passTime.getTime() - 60000;
    const delay = notificationTime - now.getTime();

    if (delay > 0) {
      const timerId = setTimeout(() => {
        new Notification("Satellite Alert", {
          body: `Satellite ${nextPass.satelliteName} will pass over your selected location (${lat}, ${lon}) in 1 minute.`,
        });
      }, delay);

      return () => clearTimeout(timerId);
    }
  }, [nextPass, lat, lon]);


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

  const handleCompute = useCallback(() => {
    if (!lat || !lon) {
      toast({ title: "Error", description: "Please provide valid latitude and longitude.", variant: "destructive" });
      return;
    }
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast({ title: "Error", description: "Please select a valid date range.", variant: "destructive" });
      return;
    }

    setIsComputing(true);
    setNextPass(null);
    fetchNextPass(lat, lon);

    setTimeout(() => {
      const mockData = generateMockMetricData(dateRange, groundTruthData || undefined);
      setMetrics(mockData);
      setIsComputing(false);
      toast({ title: "Success", description: "Metrics computed successfully." });
      // We are storing metrics in local storage to be accessed by the visualizations page.
      // In a real app, this might be handled by state management (e.g., Context, Redux) or by passing data via URL.
      localStorage.setItem('metrics', JSON.stringify(mockData));
      localStorage.setItem('selectedMetric', 'NDVI'); // Default metric
    }, 1500);
  }, [lat, lon, dateRange, groundTruthData, toast, fetchNextPass]);
  
  useEffect(() => {
    if (lat && lon) {
        fetchNextPass(lat, lon);
    }
  }, [lat, lon, fetchNextPass]);


  const onMetricsUpdate = (updatedMetrics: MetricData[]) => {
    setMetrics(updatedMetrics);
    localStorage.setItem('metrics', JSON.stringify(updatedMetrics));
  }
  
  const onViewVisualizations = () => {
      router.push('/visualizations');
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
      />

      {isComputing && (
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

      {!isComputing && metrics.length > 0 && (
        <>
          <SummaryCards 
            metrics={metrics} 
            nextPass={nextPass}
            isFetchingPass={isFetchingPass}
          />
          <MetricsTable 
            metrics={metrics} 
            onMetricsUpdate={onMetricsUpdate} 
            location={`${lat}, ${lon}`}
            dateRange={dateRangeString}
            onViewVisualizations={onViewVisualizations}
          />
          {/* The Visualizations component is now on a separate page */}
        </>
      )}
    </div>
  );
}
