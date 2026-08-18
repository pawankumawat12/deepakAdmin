import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(emailRegex, "Enter a valid admin email"),

  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      passwordRegex,
      "Password must be 8+ characters with uppercase, lowercase, number and special character"
    ),

  rememberMe: z.boolean().default(false),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers")
    .regex(/^123456$/, "Use the demo code: 123456"),
});