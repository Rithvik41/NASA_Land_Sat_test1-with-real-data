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

const GetWeatherReportOutputSchema = z.object({
    temperature: z.number().describe('The current temperature in Celsius.'),
    conditions: z.string().describe('A brief description of the current weather conditions (e.g., Sunny, Partly Cloudy).'),
    humidity: z.number().describe('The current humidity percentage (0-100).'),
    windSpeed: z.number().describe('The current wind speed in km/h.'),
    iconName: z.string().describe('The name of a relevant lucide-react icon (e.g., Sun, Cloudy, Wind, Umbrella).'),
});
export type GetWeatherReportOutput = z.infer<typeof GetWeatherReportOutputSchema>;

export async function getWeatherReport(input: GetWeatherReportInput): Promise<GetWeatherReportOutput> {
  return getWeatherReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWeatherReportPrompt',
  input: {schema: GetWeatherReportInputSchema},
  output: {schema: GetWeatherReportOutputSchema},
  prompt: `You are a weather reporting service. Given the coordinates, provide the current weather report.

  The current date is ${new Date().toISOString()}.

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}

  Respond with the current temperature in Celsius, a brief description of conditions, humidity percentage, wind speed in km/h, and a suitable icon name from the lucide-react library.
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
