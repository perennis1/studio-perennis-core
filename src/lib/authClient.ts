// src/lib/authClient.ts

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:5000";

// Use contract types
import { LoginInput, User, UserWithToken } from '@studio-perennis/contracts';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User; // Using contract User type (without token)
};

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message || "Registration failed");
  }

  const data = await res.json();
  
  // Validate response matches our expected structure
  const validatedUser: User = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    avatar: data.user.avatar,
    tagline: data.user.tagline,
    isAdmin: data.user.isAdmin,
  };

  return {
    message: data.message,
    token: data.token,
    user: validatedUser,
  };
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();
  
  // Validate response matches our expected structure
  const validatedUser: User = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    avatar: data.user.avatar,
    tagline: data.user.tagline,
    isAdmin: data.user.isAdmin,
  };

  return {
    message: data.message,
    token: data.token,
    user: validatedUser,
  };
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  const userData = await res.json();
  
  // Validate response matches our expected structure
  const validatedUser: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar,
    tagline: userData.tagline,
    isAdmin: userData.isAdmin,
  };

  return validatedUser;
}

// Helper to create UserWithToken for context
export function createUserWithToken(user: User, token: string): UserWithToken {
  return {
    ...user,
    token,
  };
}