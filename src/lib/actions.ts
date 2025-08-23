"use server";

import { generateDataInsights } from "@/ai/flows/generate-insights";
import { generateReportSummary } from "@/ai/flows/generate-report-summary";
import { suggestCoordinates } from "@/ai/flows/suggest-coordinates";
import { predictSatellitePass } from "@/ai/flows/predict-satellite-pass";
import { getWeatherReport } from "@/ai/flows/get-weather-report";
import { chatbot } from "@/ai/flows/chatbot";
import type { MetricData, SatellitePassData, WeatherData } from "@/lib/types";
import type { ChatbotInput, ChatbotOutput } from "@/ai/flows/chatbot";

export async function suggestCoordinatesAction(locationDescription: string) {
  try {
    const result = await suggestCoordinates({ locationDescription });
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: "Failed to suggest coordinates. Please try again." };
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
    console.error(error);
    return { error: "Failed to generate insight. Please try again." };
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
    console.error(error);
    return { error: "Failed to generate summary report. Please try again." };
  }
}

export async function predictSatellitePassAction(input: { latitude: number; longitude: number; }): Promise<{data: SatellitePassData | null, error: string | null}> {
    try {
        const result = await predictSatellitePass(input);
        return { data: result, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: "Failed to predict satellite pass. Please try again." };
    }
}

export async function getWeatherReportAction(input: { latitude: number; longitude: number; }): Promise<{data: WeatherData | null, error: string | null}> {
    try {
        const result = await getWeatherReport(input);
        return { data: result, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: "Failed to get weather report. Please try again." };
    }
}

export async function chatbotAction(input: ChatbotInput): Promise<{ data: ChatbotOutput | null; error: string | null; }> {
    try {
        const result = await chatbot(input);
        return { data: result, error: null };
    } catch (error) {
        console.error("Chatbot action error:", error);
        return { data: null, error: "An error occurred while communicating with the chatbot." };
    }
}
