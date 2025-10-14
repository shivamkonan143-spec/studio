
'use server';
/**
 * @fileOverview An AI flow for editing images based on text prompts.
 *
 * - editThumbnail - A function that takes an image and a prompt and returns an edited image.
 * - EditThumbnailInput - The input type for the editThumbnail function.
 * - EditThumbnailOutput - The return type for the editThumbnail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EditThumbnailInputSchema = z.object({
  image: z.string().describe(
    "A photo of the thumbnail, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  prompt: z.string().describe('A description of the edits to make to the image.'),
});
export type EditThumbnailInput = z.infer<typeof EditThumbnailInputSchema>;

const EditThumbnailOutputSchema = z.object({
  editedImage: z.string().optional().describe('The edited image as a data URI.'),
});
export type EditThumbnailOutput = z.infer<typeof EditThumbnailOutputSchema>;

export async function editThumbnail(input: EditThumbnailInput): Promise<EditThumbnailOutput> {
  return editThumbnailFlow(input);
}

const editThumbnailFlow = ai.defineFlow(
  {
    name: 'editThumbnailFlow',
    inputSchema: EditThumbnailInputSchema,
    outputSchema: EditThumbnailOutputSchema,
  },
  async ({ image, prompt }) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: image } },
            { text: prompt },
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    return { editedImage: media.url };
  }
);

    