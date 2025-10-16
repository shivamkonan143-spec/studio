import {genkit, type GenkitErrorCode, type GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {nextJsAuth} from '@genkit-ai/next/auth';
import {firebase} from 'genkit/plugins/firebase';

function isGenkitError(
  error: any
): error is GenkitError<GenkitErrorCode | string> {
  return error.isGenkitError;
}

export const ai = genkit({
  plugins: [
    firebase(),
    nextJsAuth(async (user) => {
      if (!user) {
        return null;
      }
      return {
        uid: user.uid,
        email: user.email,
        email_verified: user.email_verified,
        name: user.name,
        picture: user.picture,
        custom: {},
      };
    }),
    googleAI({apiKey: process.env.GEMINI_API_KEY}),
  ],
  model: 'googleai/gemini-2.5-flash',
  enableTracingAndMetrics: true,
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  evaluator: 'firebase',
});
