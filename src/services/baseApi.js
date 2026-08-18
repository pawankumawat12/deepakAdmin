import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth", "Product", "Category"],
  endpoints: () => ({}),
});

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendOtp: build.mutation({
      query: (email) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    resendOtp: build.mutation({
      query: (email) => ({
        url: "/auth/resend-otp",
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
  useSendOtpMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
