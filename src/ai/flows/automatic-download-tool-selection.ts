'use server';

/**
 * @fileOverview Automatically determines the appropriate download tool for a given video URL using AI.
 *
 * - automaticDownloadToolSelection - A function that handles the automatic download tool selection process.
 * - AutomaticDownloadToolSelectionInput - The input type for the automaticDownloadToolSelection function.
 * - AutomaticDownloadToolSelectionOutput - The return type for the automaticDownloadToolSelection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticDownloadToolSelectionInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the video to download.'),
});
export type AutomaticDownloadToolSelectionInput = z.infer<typeof AutomaticDownloadToolSelectionInputSchema>;

const AutomaticDownloadToolSelectionOutputSchema = z.object({
  downloadTool: z.string().describe('The recommended download tool for the given video URL.'),
  reasoning: z.string().describe('The reasoning behind the tool selection.'),
});
export type AutomaticDownloadToolSelectionOutput = z.infer<typeof AutomaticDownloadToolSelectionOutputSchema>;

export async function automaticDownloadToolSelection(input: AutomaticDownloadToolSelectionInput): Promise<AutomaticDownloadToolSelectionOutput> {
  return automaticDownloadToolSelectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticDownloadToolSelectionPrompt',
  input: {schema: AutomaticDownloadToolSelectionInputSchema},
  output: {schema: AutomaticDownloadToolSelectionOutputSchema},
  prompt: `You are an expert system designed to determine the best download tool for a given video URL.

  Based on the video URL, analyze the URL to determine the source of the video and recommend the most appropriate download tool.
  Explain your reasoning for selecting the tool.

  If the URL contains 'youtube.com' or 'youtu.be', you MUST recommend 'youtube-dl', regardless of any other parameters in the URL.

  Available download tools:
  - youtube-dl
  - ffmpeg
  - other generic downloader

  Respond in a JSON format with the downloadTool and reasoning fields.

  Video URL: {{{videoUrl}}}`,
});

const automaticDownloadToolSelectionFlow = ai.defineFlow(
  {
    name: 'automaticDownloadToolSelectionFlow',
    inputSchema: AutomaticDownloadToolSelectionInputSchema,
    outputSchema: AutomaticDownloadToolSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
