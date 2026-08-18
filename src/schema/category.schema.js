import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  status: z.enum(["Active", "Inactive"]),
});
