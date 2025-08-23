import { config } from 'dotenv';
config();

import '@/ai/flows/generate-report-summary.ts';
import '@/ai/flows/generate-insights.ts';
import '@/ai/flows/suggest-coordinates.ts';
import '@/ai/flows/predict-satellite-pass.ts';
import '@/ai/flows/get-weather-report.ts';
import '@/ai/flows/chatbot.ts';
import '@/ai/flows/plan-crops.ts';
import '@/ai/flows/schedule-irrigation.ts';
