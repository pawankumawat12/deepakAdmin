import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.user?.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Auth", "Product", "Category"],
  endpoints: () => ({}),
});

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestOtp: build.mutation({ query: (email) => ({ url: "/auth/request-otp", method: "POST", body: { email } }) }),
    verifyOtp: build.mutation({ query: (payload) => ({ url: "/auth/verify-otp", method: "POST", body: payload }), invalidatesTags: ["Auth"] }),
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation } = authApi;
