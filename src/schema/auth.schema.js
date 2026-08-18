import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email("Enter a valid admin email"),
});
export const otpSchema = z.object({
  otp: z.string().regex(/^123456$/, "Use the demo code: 123456"),
});
