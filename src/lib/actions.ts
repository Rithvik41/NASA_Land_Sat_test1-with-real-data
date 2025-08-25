
"use server";

import { generateDataInsights } from "@/ai/flows/generate-insights";
import { generateReportSummary } from "@/ai/flows/generate-report-summary";
import { suggestCoordinates } from "@/ai/flows/suggest-coordinates";
import { predictSatellitePass } from "@/ai/flows/predict-satellite-pass";
import { getWeatherReport } from "@/ai/flows/get-weather-report";
import { chatbot } from "@/ai/flows/chatbot";
import { planCrops } from "@/ai/flows/plan-crops";
import { scheduleIrrigation } from "@/ai/flows/schedule-irrigation";

import type { MetricData, SatellitePassData, WeatherData, CropPlan, IrrigationSchedule } from "@/lib/types";
import type { ChatbotInput, ChatbotOutput } from "@/ai/flows/chatbot";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export async function suggestCoordinatesAction(locationDescription: string) {
  try {
    const result = await suggestCoordinates({ locationDescription });
    return { data: result };
  } catch (error) {
    console.error("suggestCoordinatesAction Error:", error);
    return { error: `AI Error: ${getErrorMessage(error)}` };
  }
}

export async function generateInsightAction(
  metric: Omit<MetricData, "timeSeries" | "groundTruth" | "insight">
) {
  try {
    const result = await generateDataInsights({
      metricName: metric.name,
      firstValue: metric.firstValue ?? 0,
      lastValue: metric.lastValue ?? 0,
      percentageChange: metric.percentageChange ?? 0,
      numberOfValidPoints: metric.n,
    });
    return { data: result.insight };
  } catch (error) {
    console.error("generateInsightAction Error:", error);
    return { error: `AI Error: ${getErrorMessage(error)}` };
  }
}

export async function generateReportAction(
  metricsData: MetricData[],
  location: string,
  dateRange: string
) {
  try {
    const simplifiedMetrics = metricsData.map(d => ({
        name: d.name,
        firstValue: d.firstValue,
        lastValue: d.lastValue,
        percentageChange: d.percentageChange,
        n: d.n
    }));

    const result = await generateReportSummary({
      metricsData: JSON.stringify(simplifiedMetrics, null, 2),
      location,
      dateRange,
    });
    return { data: result.summaryReport };
  } catch (error) {
    console.error("generateReportAction Error:", error);
    return { error: `AI Error: ${getErrorMessage(error)}` };
  }
}

export async function predictSatellitePassAction(input: { latitude: number; longitude: number; }): Promise<{data: any | null, error: string | null}> {
    try {
        const query = new URLSearchParams({
            lat: String(input.latitude),
            lon: String(input.longitude),
            sat: 'landsat8' // or landsat9
        }).toString();

        // This assumes the app is running on localhost:9002, replace with deployed URL in production
        const host = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:9002';
        const response = await fetch(`${host}/api/satellite/pass?${query}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch satellite pass: ${response.statusText}`);
        }
        
        const result = await response.json();
        // The API returns 'approxClosestApproachUTC', let's map it to what the frontend expects
        return { data: {
            passTime: result.approxClosestApproachUTC,
            satelliteName: result.satellite,
            status: 'Active', // Mock status, TLE doesn't provide this directly
            speed: 7.5 // Typical LEO speed
        }, error: null };
    } catch (error) {
        console.error("predictSatellitePassAction Error:", error);
        return { data: null, error: getErrorMessage(error) };
    }
}

export async function getWeatherReportAction(input: { latitude: number; longitude: number; }): Promise<{data: WeatherData | null, error: string | null}> {
    try {
        // AI version is kept as a fallback or for different kinds of reports
        const result = await getWeatherReport(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("getWeatherReportAction Error:", error);
        return { data: null, error: `AI Error: ${getErrorMessage(error)}` };
    }
}

export async function chatbotAction(input: ChatbotInput): Promise<{ data: ChatbotOutput | null; error: string | null; }> {
    try {
        const result = await chatbot(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Chatbot action error:", error);
        return { data: null, error: `AI Error: ${getErrorMessage(error)}` };
    }
}

export async function planCropsAction(input: { latitude: number; longitude: number; }): Promise<{ data: CropPlan | null; error: string | null; }> {
    try {
        const result = await planCrops(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Crop planning action error:", error);
        return { data: null, error: `AI Error: ${getErrorMessage(error)}` };
    }
}

export async function scheduleIrrigationAction(input: { latitude: number; longitude: number; }): Promise<{ data: IrrigationSchedule | null; error: string | null; }> {
    try {
        const result = await scheduleIrrigation(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Irrigation scheduling action error:", error);
        return { data: null, error: `AI Error: ${getErrorMessage(error)}` };
    }
}
