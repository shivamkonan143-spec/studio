'use server';

// NOTE: This is a placeholder for a real email sending service.
// You would need to integrate a service like Resend, SendGrid, or Nodemailer
// to actually send the email. The `resend` and `react-email` packages have been
// added to package.json to make this easier in the future.
export async function sendSupportMessage(formData: FormData) {
  const message = formData.get('message') as string;
  const userEmail = formData.get('userEmail') as string | null;

  if (!message) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  // This function is no longer used and can be removed or repurposed.
  // The UI now uses a mailto: link.
  console.log('--- THIS ACTION IS NO LONGER IN USE ---');
  console.log('User:', userEmail || 'Anonymous');
  console.log('Message:', message);
  console.log('-----------------------');

  // Returning a success to avoid breaking anything if it's still called,
  // but it should be removed from the UI.
  return { success: true, error: null };
}
