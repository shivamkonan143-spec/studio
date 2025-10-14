
'use server';

import {
  automaticDownloadToolSelection,
  type AutomaticDownloadToolSelectionInput,
  type AutomaticDownloadToolSelectionOutput,
} from '@/ai/flows/automatic-download-tool-selection';

export async function getVideoTool(
  formData: FormData
): Promise<{ success: true; data: AutomaticDownloadToolSelectionOutput } | { success: false; error: string }> {
  const url = formData.get('url') as string;

  if (!url) {
    return { success: false, error: 'Please enter a video URL.' };
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (_) {
    return { success: false, error: 'Please enter a valid video URL.' };
  }


  try {
    const input: AutomaticDownloadToolSelectionInput = { videoUrl: url };
    const result = await automaticDownloadToolSelection(input);
    return { success: true, data: result };
  } catch (e) {
    console.error('AI Error:', e);
    return { success: false, error: 'Failed to analyze URL with AI. Please check the link or try again.' };
  }
}
