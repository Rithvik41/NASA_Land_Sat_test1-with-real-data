'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary report of key findings from computed environmental metrics.
 *
 * - generateReportSummary - A function that generates a summary report of environmental metrics.
 * - ReportSummaryInput - The input type for the generateReportSummary function.
 * - ReportSummaryOutput - The return type for the generateReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSummaryInputSchema = z.object({
  metricsData: z.string().describe('A JSON string containing the computed environmental metrics data. Should include metric name, first value, last value, percentage change, and number of valid points (n).'),
  location: z.string().describe('The location (latitude and longitude) for which the metrics were computed.'),
  dateRange: z.string().describe('The date range for which the metrics were computed (e.g., "January 1, 2023 - December 31, 2023").'),
});
export type ReportSummaryInput = z.infer<typeof ReportSummaryInputSchema>;

const ReportSummaryOutputSchema = z.object({
  summaryReport: z.string().describe('A concise summary report of the key findings (trends, anomalies) from the computed environmental metrics.'),
});
export type ReportSummaryOutput = z.infer<typeof ReportSummaryOutputSchema>;

export async function generateReportSummary(input: ReportSummaryInput): Promise<ReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: ReportSummaryInputSchema},
  output: {schema: ReportSummaryOutputSchema},
  prompt: `You are an expert environmental data analyst.

You are provided with computed environmental metrics data for a specific location and date range.
Your task is to generate a concise summary report highlighting the key findings, including trends and anomalies.

Location: {{{location}}}
Date Range: {{{dateRange}}}
Metrics Data (JSON string): {{{metricsData}}}

Based on this data, generate a summary report of the key findings, including any significant trends, anomalies, or notable changes in the environmental metrics. The summary should be easily understandable by someone without a technical background.
`, // Updated prompt
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: ReportSummaryInputSchema,
    outputSchema: ReportSummaryOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Error generating report summary:', error);
      throw new Error(`Failed to generate report summary: ${(error as any).message || 'Unknown error'}`);
    }
  }
);
