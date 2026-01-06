import { z } from 'zod';

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const RegisterInput = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const UserResponse = z.object({
  id: z.number(),  // CHANGED from string() to number()
  name: z.string().optional(),
  email: z.string(),
  isAdmin: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  tagline: z.string().nullable().optional()
});