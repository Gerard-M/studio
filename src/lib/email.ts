'use server';
import { Resend } from 'resend';

// NOTE: This check is important to prevent the app from crashing during the build process
// when environment variables are not yet available.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!resend) {
    console.warn("Resend is not configured. RESEND_API_KEY is missing. Skipping email.");
    // In a real app, you might want to throw an error or handle this differently.
    // For this prototype, we'll just log a warning and succeed silently.
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({
      // NOTE: For production, you must use a domain you have verified with Resend.
      // The 'onboarding@resend.dev' address is for testing and development purposes only.
      from: 'Docutrack <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send email via Resend.');
    }

    return data;
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    throw new Error('An unexpected error occurred while sending the email.');
  }
}
