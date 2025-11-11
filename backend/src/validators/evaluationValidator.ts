import { z } from 'zod';

export const createEvaluationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  phone: z.string().optional(),
  currentLocation: z.string().min(2, 'Current location is required').trim(),
  professionalSummary: z.string().min(50, 'Professional summary must be at least 50 characters'),
  targetCountry: z.string().min(2, 'Target country is required').trim(),
  visaType: z.string().min(1, 'Visa type is required').trim(),
  visaTypeId: z.string().min(1, 'Visa type ID is required').trim()
});

export const emailResultsSchema = z.object({
  email: z.string().email('Invalid email address')
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type EmailResultsInput = z.infer<typeof emailResultsSchema>;
