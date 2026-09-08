import { z } from "zod";

export const cmsPageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Page title must be at least 2 characters")
    .max(255, "Page title cannot exceed 255 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z
    .string()
    .trim()
    .min(1, "Page content is required"),
  status: z.enum(["draft", "published"]),
  isActive: z.boolean().default(true),
  seoTitle: z.string().trim().max(255).optional().or(z.literal("")),
  seoDescription: z.string().trim().optional().or(z.literal("")),
  seoKeywords: z.string().trim().optional().or(z.literal("")),
});

