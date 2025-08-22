'use server';

/**
 * @fileOverview A flow for predicting the next satellite pass time for a given location.
 *
 * - predictSatellitePass - A function that handles the satellite pass prediction process.
 * - PredictSatellitePassInput - The input type for the predictSatellitePass function.
 * - PredictSatellitePassOutput - The return type for the predictSatellitePass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictSatellitePassInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type PredictSatellitePassInput = z.infer<typeof PredictSatellitePassInputSchema>;

const PredictSatellitePassOutputSchema = z.object({
  passTime: z.string().describe('The predicted next satellite pass time in UTC ISO 8601 format.'),
});
export type PredictSatellitePassOutput = z.infer<typeof PredictSatellitePassOutputSchema>;

export async function predictSatellitePass(input: PredictSatellitePassInput): Promise<PredictSatellitePassOutput> {
  return predictSatellitePassFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSatellitePassPrompt',
  input: {schema: PredictSatellitePassInputSchema},
  output: {schema: PredictSatellitePassOutputSchema},
  prompt: `You are a satellite tracking expert. Given the coordinates, predict the next satellite pass time (e.g., for a satellite like Landsat 8 or similar earth observation satellite).

  The current date is ${new Date().toISOString()}. The returned pass time should be in the near future (within the next 24 hours).

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}

  Respond with the predicted pass time in UTC ISO 8601 format.
`,
});

const predictSatellitePassFlow = ai.defineFlow(
  {
    name: 'predictSatellitePassFlow',
    inputSchema: PredictSatellitePassInputSchema,
    outputSchema: PredictSatellitePassOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
