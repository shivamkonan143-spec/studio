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

  try {
    // ---- THIS IS WHERE YOU WOULD SEND THE EMAIL ----
    // Example using a hypothetical email service:
    // await sendEmail({
    //   from: 'support@your-app.com',
    //   to: 'shivamkonan143@gmail.com',
    //   subject: `Support Request ${userEmail ? `from ${userEmail}`: ''}`,
    //   text: message,
    // });
    
    console.log('--- SUPPORT REQUEST ---');
    console.log('User:', userEmail || 'Anonymous');
    console.log('Message:', message);
    console.log('-----------------------');
    // ------------------------------------------------

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending support message:', error);
    return { success: false, error: 'Failed to send message. Please try again later.' };
  }
}
