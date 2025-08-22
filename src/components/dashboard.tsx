"use client";

import React, { useState, useCallback, useEffect } from "react";
import { addDays, format, differenceInMilliseconds } from "date-fns";
import type { DateRange } from "react-day-picker";
import { InputPanel } from "@/components/input-panel";
import { SummaryCards } from "@/components/summary-cards";
import { MetricsTable } from "@/components/metrics-table";
import { Visualizations } from "@/components/visualizations";
import { useToast } from "@/hooks/use-toast";
import type { MetricData, GroundTruthDataPoint } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { predictSatellitePassAction } from "@/lib/actions";

// Mock data generation
const metricNames = ['NDVI', 'NDBI', 'NDWI', 'NBR', 'MNDWI', 'Yield Index', 'Soil Moisture Percent', 'Water Percent', 'SWIR Ratio'];

function generateMockMetricData(dateRange: DateRange, groundTruth?: GroundTruthDataPoint[]): MetricData[] {
  const from = dateRange.from || new Date();
  const to = dateRange.to || new Date();
  const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

  return metricNames.map(name => {
    let baseValue = Math.random() * 2 - 1;
    if (name.includes('Percent') || name === 'Yield Index') {
        baseValue = Math.random() * 100;
    }

    const timeSeries = Array.from({ length: diffDays }, (_, i) => {
      const date = addDays(from, i);
      const value = baseValue + (Math.random() - 0.5) * 0.1 * (i / diffDays); // Simulate some trend
      return { date: date.toISOString(), value };
    });

    const validPoints = timeSeries.filter(d => d.value !== null && !isNaN(d.value));
    const firstValue = validPoints.length > 0 ? validPoints[0].value : null;
    const lastValue = validPoints.length > 0 ? validPoints[validPoints.length - 1].value : null;
    
    let percentageChange: number | null = null;
    if (firstValue !== null && lastValue !== null && firstValue !== 0) {
      percentageChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
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
  const [nextPass, setNextPass] = useState<string | null>(null);
  const [isFetchingPass, setIsFetchingPass] = useState(false);

  useEffect(() => {
    // Request notification permission when component mounts
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!nextPass || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const passTime = new Date(nextPass);
    const now = new Date();
    // Notify 1 minute before the pass
    const notificationTime = passTime.getTime() - 60000;
    const delay = notificationTime - now.getTime();

    if (delay > 0) {
      const timerId = setTimeout(() => {
        new Notification("Satellite Alert", {
          body: `A satellite will pass over your selected location (${lat}, ${lon}) in 1 minute.`,
          icon: "/satellite.png", // Assumes you have a satellite icon in your public folder
        });
      }, delay);

      // Cleanup timeout if component unmounts or nextPass changes
      return () => clearTimeout(timerId);
    }
  }, [nextPass, lat, lon]);


  const fetchNextPass = useCallback(async (latitude: string, longitude: string) => {
      setIsFetchingPass(true);
      const result = await predictSatellitePassAction({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
      if (result.error) {
          toast({ title: "AI Error", description: result.error, variant: "destructive" });
          setNextPass(null);
      } else if (result.data) {
          setNextPass(result.data.passTime);
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

    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockMetricData(dateRange, groundTruthData || undefined);
      setMetrics(mockData);
      setIsComputing(false);
      toast({ title: "Success", description: "Metrics computed successfully." });
    }, 1500);
  }, [lat, lon, dateRange, groundTruthData, toast, fetchNextPass]);

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
