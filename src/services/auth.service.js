import { authApi } from "./authApi";

// For non-React callers; React screens can use the generated mutation hooks.
export const authService = {
  requestOtp: (email) => authApi.endpoints.sendOtp.initiate(email),
  verifyOtp: (payload) => authApi.endpoints.verifyOtp.initiate(payload),
};
