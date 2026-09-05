import { z } from "zod";

export const emailTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required"),
  slug: z.string().trim().min(1, "Template slug is required"),
  subject: z.string().trim().min(1, "Template subject is required"),
  description: z.string().optional(),
  body: z.string().trim().min(1, "Template body is required"),
  isActive: z.boolean(),
});
