'use server';

import {
  generateVideoScript as generateVideoScriptFlow,
  type GenerateVideoScriptInput,
  type GenerateVideoScriptOutput,
} from '@/ai/flows/generate-video-script';


export async function generateVideoScript(
  formData: FormData
): Promise<{ success: true; data: GenerateVideoScriptOutput } | { success: false; error: string }> {
  const url = formData.get('url') as string;

  if (!url) {
    return { success: false, error: 'Please enter a video URL.' };
  }

  try {
    const input: GenerateVideoScriptInput = { videoUrl: url };
    const result = await generateVideoScriptFlow(input);
    return { success: true, data: result };
  } catch (e) {
    console.error('AI Error:', e);
    return { success: false, error: 'Failed to generate script with AI. Please check the link or try again.' };
  }
}
