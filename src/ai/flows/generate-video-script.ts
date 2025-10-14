'use server';

/**
 * @fileOverview Generates a video script from a YouTube URL.
 *
 * - generateVideoScript - A function that handles the video script generation process.
 * - GenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - GenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import ytdl from 'ytdl-core';

const GenerateVideoScriptInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the YouTube video.'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  script: z.string().describe('The generated script for the video.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

// Tool to get video transcript
const getVideoTranscript = ai.defineTool(
  {
    name: 'getVideoTranscript',
    description: 'Retrieves the transcript for a given YouTube video URL.',
    inputSchema: z.object({
      url: z.string().describe('The URL of the YouTube video.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const info = await ytdl.getInfo(input.url);
      const tracks =
        info.player_response.captions?.playerCaptionsTracklistRenderer
          .captionTracks;

      if (tracks && tracks.length > 0) {
        const track =
          tracks.find((t) => t.vssId?.startsWith('a.')) || // Auto-generated
          tracks.find((t) => t.vssId?.startsWith('.')); // Manually-created

        if (track) {
          const transcriptResponse = await fetch(track.baseUrl);
          const transcriptXml = await transcriptResponse.text();
          // Simple XML parsing to extract text
          const lines = transcriptXml
            .replace(/<text[^>]*>/g, '\n')
            .replace(/<\/[^>]*>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/<[^>]*>/g, '')
            .trim()
            .split('\n')
            .map(line => decodeURIComponent(line.replace(/\+/g, ' ')).trim())
            .filter(line => line.length > 0)
            .join(' ');
          return lines;
        }
      }
      return 'No transcript available for this video.';
    } catch (e) {
      console.error('Error fetching transcript:', e);
      return 'Could not retrieve transcript.';
    }
  }
);


const prompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  tools: [getVideoTranscript],
  prompt: `You are an expert scriptwriter. You will be given the transcript of a YouTube video.
  Your task is to analyze the transcript, clean it up, and format it into a well-structured and readable script.
  
  Instructions:
  1. Use the 'getVideoTranscript' tool with the provided 'videoUrl' to get the video's transcript.
  2. Read through the transcript to understand the content and flow.
  3. Correct any obvious transcription errors.
  4. Add paragraph breaks to structure the text logically.
  5. Format the text into a clear script format. Do not add speaker names or timestamps.
  6. If a transcript cannot be found, your entire response should be 'Sorry, a transcript for this video is not available, so a script cannot be generated.'.

  Return the final script in the 'script' field of the output JSON.

  Video URL: {{{videoUrl}}}`,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
