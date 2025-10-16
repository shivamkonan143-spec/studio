import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {firebase} from 'genkit/plugins/firebase';

function isGenkitError(
  error: any
): error is GenkitError<GenkitErrorCode | string> {
  return error.isGenkitError;
}

export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  model: 'googleai/gemini-2.5-flash',
  enableTracingAndMetrics: true,
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  evaluator: 'firebase',
});
