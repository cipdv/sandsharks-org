import { z } from 'zod';

export const PostFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  beginnerClinic: z.object({
    beginnerClinicOffered: z.boolean().default(false),
    beginnerClinicStartTime: z.string(),
    beginnerClinicEndTime: z.string(),
  }).optional(),
  
});