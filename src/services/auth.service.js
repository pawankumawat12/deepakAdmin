import { api } from "./api";
export const authService = {
  requestOtp: (email) => api.post("/auth/request-otp", { email }),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload),
};
