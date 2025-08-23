'use server';

/**
 * @fileOverview A flow for getting the current weather report for a given location.
 *
 * - getWeatherReport - A function that handles the weather report process.
 * - GetWeatherReportInput - The input type for the getWeatherReport function.
 * - GetWeatherReportOutput - The return type for the getWeatherReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeatherReportInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type GetWeatherReportInput = z.infer<typeof GetWeatherReportInputSchema>;

const HourlyForecastSchema = z.object({
    time: z.string().describe("The time for the forecast (e.g., '10:00 AM', '3 PM')."),
    temperature: z.number().describe('The temperature in Celsius.'),
    conditions: z.string().describe('A brief description of the weather conditions (e.g., "Sunny").'),
    iconName: z.string().describe('The name of a relevant lucide-react icon (e.g., Sun, Cloudy, Wind, Umbrella).'),
});

const GetWeatherReportOutputSchema = z.object({
    current: z.object({
      temperature: z.number().describe('The current temperature in Celsius.'),
      conditions: z.string().describe('A brief description of the current weather conditions (e.g., Sunny, Partly Cloudy).'),
      humidity: z.number().describe('The current humidity percentage (0-100).'),
      windSpeed: z.number().describe('The current wind speed in km/h.'),
      iconName: z.string().describe('The name of a relevant lucide-react icon (e.g., Sun, Cloudy, Wind, Umbrella).'),
    }),
    forecast: z.array(HourlyForecastSchema).describe('An array of hourly forecast data for the next 24 hours.'),
    summary: z.string().describe("A brief, one-sentence summary of the day's weather outlook (e.g., 'Expect clear skies and warm temperatures throughout the day.')."),
});
export type GetWeatherReportOutput = z.infer<typeof GetWeatherReportOutputSchema>;

export async function getWeatherReport(input: GetWeatherReportInput): Promise<GetWeatherReportOutput> {
  return getWeatherReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWeatherReportPrompt',
  input: {schema: GetWeatherReportInputSchema},
  output: {schema: GetWeatherReportOutputSchema},
  prompt: `You are a weather reporting service. Given the coordinates, provide a detailed weather report for the entire day.

  The current date is ${new Date().toISOString()}.

  Your response must include:
  1. The current weather conditions (temperature, conditions, humidity, wind speed, and an icon).
  2. An hourly forecast for the next 24 hours, starting from the current hour.
  3. A concise summary of the day's weather.

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}
`,
});

const getWeatherReportFlow = ai.defineFlow(
  {
    name: 'getWeatherReportFlow',
    inputSchema: GetWeatherReportInputSchema,
    outputSchema: GetWeatherReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
