import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminLogin: build.mutation({
      query: (payload) => (

        {
        url: "/auth/admin-login",
        method: "POST",
        body: payload,
      }
    ),
    }),
    sendOtp: build.mutation({
      query: (email) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOtp: build.mutation({
      query: (payload) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    forgotPassword: build.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: build.mutation({
      query: ({ accessToken, password }) => ({
        url: `/auth/reset-password/${accessToken}`,
        method: "POST",
        body: { password },
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
