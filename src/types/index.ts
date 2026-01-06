// src/types/index.ts
export type {
  User,
  UserWithToken,
  LoginInput,
} from '@studio-perennis/contracts';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
