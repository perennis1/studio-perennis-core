//C:\Users\studi\my-next-app\packages\contracts\src\profile.ts

import { z } from 'zod';

export const ProfileUpdateInput = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  residence: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']).optional(),
  nationality: z.string().optional(),
  avatar: z.instanceof(File).optional().transform((file) => file?.name || null)
});

export const ProfileResponse = z.object({
  id: z.number(),  // CHANGED from string() to number()
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  residence: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  tagline: z.string().optional(),
  isAdmin: z.boolean().optional()
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInput>;
export type ProfileResponse = z.infer<typeof ProfileResponse>;