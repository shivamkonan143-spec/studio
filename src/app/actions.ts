
'use server';

import {
  automaticDownloadToolSelection,
  type AutomaticDownloadToolSelectionInput,
  type AutomaticDownloadToolSelectionOutput,
} from '@/ai/flows/automatic-download-tool-selection';

// A more forgiving regex for URLs that includes query parameters.
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-?=%&]*)*\/?$/;


export async function getVideoTool(
  formData: FormData
): Promise<{ success: true; data: AutomaticDownloadToolSelectionOutput } | { success: false; error: string }> {
  const url = formData.get('url') as string;

  if (!url) {
    return { success: false, error: 'Please enter a video URL.' };
  }

  // Loosened URL validation
  if (!URL_REGEX.test(url)) {
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
