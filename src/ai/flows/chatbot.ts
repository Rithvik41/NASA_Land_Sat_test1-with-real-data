'use server';

/**
 * @fileOverview A chatbot flow to assist users of the Earth Insights Dashboard.
 *
 * - chatbot - A function that handles the chatbot conversation.
 * - ChatbotInput - The input type for the chatbot function.
 * - ChatbotOutput - The return type for the chatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ChatMessageSchema } from '@/lib/types';

const ChatbotInputSchema = z.object({
  messages: z.array(ChatMessageSchema),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatbotInputSchema },
  output: { schema: ChatbotOutputSchema },
  prompt: `You are a friendly and helpful AI assistant for the "Earth Insights Dashboard". Your goal is to help users understand and use the application effectively.

You can answer questions about:
- What the different environmental metrics (NDVI, NDBI, NDWI, etc.) mean.
- How to use the dashboard features (e.g., "how do I export data?").
- General concepts about satellite imagery and environmental monitoring.

Keep your answers concise and easy to understand.

Here is the conversation history:
{{#each messages}}
{{role}}: {{{content}}}
{{/each}}
model:`,
});


const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return { response: output!.response };
  }
);
