import { z } from 'zod';

export const PostFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  beginnerClinic: z.object({
    beginnerClinicOffered: z.boolean().default(false),
    beginnerClinicStartTime: z.string(),
    beginnerClinicEndTime: z.string(),
  }).optional(),
  
});