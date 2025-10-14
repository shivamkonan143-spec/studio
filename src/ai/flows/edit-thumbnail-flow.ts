'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditThumbnailInputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The thumbnail image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The user prompt describing the edits to make.'),
});
export type EditThumbnailInput = z.infer<typeof EditThumbnailInputSchema>;

const EditThumbnailOutputSchema = z.object({
    editedImageUrl: z.string().describe("The data URI of the edited image.")
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
  async ({imageUrl, prompt}) => {
    const model = ai.getModel(ai.config.imageModel!);

    const {media} = await ai.generate({
        model,
        prompt: [
            {media: {url: imageUrl}},
            {text: prompt},
        ],
        config: {
            responseModalities: ['IMAGE'],
        },
    });

    if (!media.url) {
        throw new Error('Image generation failed.');
    }
    
    return { editedImageUrl: media.url };
  }
);
