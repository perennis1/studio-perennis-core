import { z } from 'zod';

export const Course = z.object({
  id: z.number(),  // CHANGED from string() to number()
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional()
});

export const CreateCourseInput = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string()
});