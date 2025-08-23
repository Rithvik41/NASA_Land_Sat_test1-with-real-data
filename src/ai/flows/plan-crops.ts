
'use server';

/**
 * @fileOverview A flow for suggesting crop plans based on location.
 *
 * - planCrops - A function that handles the crop planning process.
 * - PlanCropsInput - The input type for the planCrops function.
 * - PlanCropsOutput - The return type for the planCrops function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PlanCropsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type PlanCropsInput = z.infer<typeof PlanCropsInputSchema>;

const CropSchema = z.object({
    name: z.string().describe("The common name of the crop."),
    reason: z.string().describe("A brief explanation of why this crop is suitable for the location and conditions."),
});

const PlanCropsOutputSchema = z.object({
    suitableCrops: z.array(CropSchema).describe("A list of crops suitable for planting at the given location."),
    plantingWindow: z.object({
        start: z.string().describe("The suggested start date for planting (e.g., 'Mid-April')."),
        end: z.string().describe("The suggested end date for planting (e.g., 'Late-May').")
    }).describe("The optimal window for planting the suggested crops."),
    cooperativeFarmingSuggestion: z.string().describe("A suggestion for how local farmers could cooperate for better yield or market access."),
});
export type PlanCropsOutput = z.infer<typeof PlanCropsOutputSchema>;


export async function planCrops(input: PlanCropsInput): Promise<PlanCropsOutput> {
  return planCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'planCropsPrompt',
  input: { schema: PlanCropsInputSchema },
  output: { schema: PlanCropsOutputSchema },
  prompt: `You are an expert agronomist providing advice to farmers. Based on the provided latitude and longitude, analyze the typical climate, soil conditions, and historical satellite data for that region to recommend a crop plan.

  The current date is ${new Date().toISOString()}.

  Location:
  - Latitude: {{{latitude}}}
  - Longitude: {{{longitude}}}

  Your response should include:
  1.  A list of 2-3 suitable crops. For each crop, provide a brief reason why it's a good choice (e.g., "Maize: Well-suited to the sandy loam soils and expected rainfall patterns in this area.").
  2.  An optimal planting window (e.g., start and end dates).
  3.  A practical suggestion for cooperative farming. This should be a tangible idea that small-scale farmers in the area could implement together to improve their outcomes. For example: "Local farmers could pool resources to invest in a shared cold storage facility, allowing them to sell their produce at more favorable times and reduce post-harvest losses." or "Consider forming a cooperative to purchase seeds and fertilizers in bulk, which would significantly reduce costs for everyone."
  `,
});

const planCropsFlow = ai.defineFlow(
  {
    name: 'planCropsFlow',
    inputSchema: PlanCropsInputSchema,
    outputSchema: PlanCropsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
