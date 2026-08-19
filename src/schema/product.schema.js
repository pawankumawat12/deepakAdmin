import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description is too long")
    .optional(),

  categoryId: z
    .string()
    .min(1, "Choose a category"),

  price: z.coerce
    .number()
    .positive("Price must be greater than zero"),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative"),

  status: z.enum(["Active", "Out of stock"]),

  imageFiles: z
    .array(z.instanceof(File))
    .max(5, "You can upload maximum 5 images.")
    .optional(),
});