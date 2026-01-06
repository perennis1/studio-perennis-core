// packages/contracts/src/index.ts
import { z } from 'zod';

// User (from your dashboard errors)
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  email: z.string().email(),
  isAdmin: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  tagline: z.string().nullable().optional()
});
export type User = z.infer<typeof UserSchema>;

// User with token (for auth responses)
export const UserWithTokenSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  email: z.string().email(),
  isAdmin: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  token: z.string()
});
export type UserWithToken = z.infer<typeof UserWithTokenSchema>;

// Auth (most common starting point)
export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string()
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Blog (from your dashboard/blog errors)
export const BlogSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  image: z.string().url().optional()
});
export type Blog = z.infer<typeof BlogSchema>;

// Auth (from auth.ts)
export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export const LoginResponse = z.object({
  user: z.object({ id: z.number(), email: z.string() }),
  token: z.string()
});
export const UserResponse = UserSchema; // Alias for backward compatibility

// Profile (from profile.ts)
export const ProfileUpdateInput = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  tagline: z.string().optional(),
});
export const LedgerPayload = z.object({
  currentInquiry: z.string().nullable(),
  currentlyStudying: z.string().nullable(),
  lastActiveInquiry: z.string().nullable(),
});

// Courses (from courses.ts)
export const Course = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
});