import { z } from "zod";

// Password policy: min 8 chars, at least one letter, at least one number
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine((val) => /[a-zA-Z]/.test(val), "Password must contain at least one letter")
  .refine((val) => /[0-9]/.test(val), "Password must contain at least one number");

// User Registration Validation Schema
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: passwordSchema,
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters long")
    .max(50, "Display name cannot exceed 50 characters"),
});

// User Login Validation Schema
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Post Create/Update Schema
export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  content: z.string().trim().min(1, "Content is required"),
  status: z.enum(["draft", "published"]).default("draft"),
});

// Comment Schema
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment content is required")
    .max(2000, "Comment cannot exceed 2000 characters"),
});

// Pagination Query Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
