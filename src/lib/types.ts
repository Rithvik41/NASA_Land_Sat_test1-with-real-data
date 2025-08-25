
import type { DateRange } from "react-day-picker";
import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export interface DataPoint {
  date: string; // Should be a date string that can be parsed by new Date()
  value: number;
}

export interface GroundTruthDataPoint {
  date: string;
  value: number;
}

export interface MetricData {
  name: string;
  timeSeries: DataPoint[];
  firstValue: number | null;
  lastValue: number | null;
  percentageChange: number | null;
  n: number;
  insight?: string;
  groundTruth?: GroundTruthDataPoint[];
}

export interface EEMetrics {
    NDVI: number;
    NDVI_stdDev: number | null;
    NDWI: number;
    MNDWI: number;
    NDBI: number;
    NBR: number;
    SWIR_RATIO: number | null;
    provenance: {
        collection: string;
        start: string;
        end: string;
        scaleMeters: number;
        aoi: {
            lat: number;
            lon: number;
            bufferKm: number;
        };
    };
}

export interface SatellitePassData {
    passTime: string;
    satelliteName: string;
    status: string;
    speed: number;
}

export interface HourlyForecast {
    time: string;
    temperature: number;
    conditions: string;
    iconName: string;
}

export interface WeatherData {
    current: {
        temperature: number;
        conditions: string;
        humidity: number;
        windSpeed: number;
        iconName: string;
    };
    forecast: HourlyForecast[];
    summary: string;
}

export interface HistoryEntry {
  id: string;
  lat: string;
  lon: string;
  locationDesc: string;
  dateRange?: DateRange;
  timestamp: Date;
}

export interface Crop {
    name: string;
    reason: string;
}

export interface CropPlan {
    suitableCrops: Crop[];
    plantingWindow: {
        start: string;
        end: string;
    };
    cooperativeFarmingSuggestion: string;
}


export interface IrrigationSchedule {
    recommendation: string;
    nextIrrigationDate: string;
    wateringDepthInches: number;
    notes: string;
}
