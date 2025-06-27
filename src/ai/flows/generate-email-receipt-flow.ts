'use server';
/**
 * @fileOverview A flow to generate an email receipt for a new event.
 *
 * - generateEmailReceipt - A function that generates an email confirmation.
 * - GenerateEmailReceiptInput - The input type for the function.
 * - GenerateEmailReceiptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const GenerateEmailReceiptInputSchema = z.object({
  userName: z.string().describe('The name of the user to address the email to.'),
  userEmail: z.string().describe('The email address of the user.'),
  eventTitle: z.string().describe('The title of the event that was created.'),
  dueDate: z.string().describe('The due date of the event in a readable format.'),
});
export type GenerateEmailReceiptInput = z.infer<typeof GenerateEmailReceiptInputSchema>;

export const GenerateEmailReceiptOutputSchema = z.object({
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type GenerateEmailReceiptOutput = z.infer<typeof GenerateEmailReceiptOutputSchema>;

export async function generateEmailReceipt(input: GenerateEmailReceiptInput): Promise<GenerateEmailReceiptOutput> {
  return generateEmailReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailReceiptPrompt',
  input: {schema: GenerateEmailReceiptInputSchema},
  output: {schema: GenerateEmailReceiptOutputSchema},
  prompt: `You are a helpful assistant for the Docutrack app.

  Your task is to generate a friendly and professional confirmation email to a user who has just created a new event.

  The user's name is {{userName}}.
  The event they created is titled "{{eventTitle}}".
  The due date for this event is {{dueDate}}.

  Generate a suitable subject line and an email body in HTML format.

  Keep the tone warm and encouraging.
  Make sure to include all the event details in the email body.
  Sign off as "The Docutrack Team".
  `,
});

const generateEmailReceiptFlow = ai.defineFlow(
  {
    name: 'generateEmailReceiptFlow',
    inputSchema: GenerateEmailReceiptInputSchema,
    outputSchema: GenerateEmailReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
