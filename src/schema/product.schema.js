import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  status: z.enum(["Active", "Out of stock"]),
});
