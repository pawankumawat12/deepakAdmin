import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminLogin: build.mutation({
      query: (payload) => ({
        url: "/auth/admin-login",
        method: "POST",
        body: payload,
      }),
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
    getMe: build.query({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),
    logout: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
    forgotPassword: build.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email, role: "admin" },
      }),
    }),
    verifyResetPasswordToken: build.mutation({
      query: (accessToken) => ({
        url: `/auth/reset-password/${encodeURIComponent(accessToken)}`,
        method: "GET",
      }),
    }),
    resetPassword: build.mutation({
      query: ({ accessToken, password }) => ({
        url: `/auth/reset-password/${encodeURIComponent(accessToken)}`,
        method: "POST",
        body: { password },
      }),
    }),
    getCustomers: build.query({
      query: (params) => ({
        url: "/auth/customers",
        params,
      }),
      providesTags: ["Customers"],
    }),
    editCustomer: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/auth/customers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: build.mutation({
      query: (id) => ({
        url: `/auth/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
    toggleCustomerStatus: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/auth/customers/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Customers"],
    }),
    getBlockedSupportRequests: build.query({
      query: (params) => ({
        url: "/auth/blocked-support-requests",
        params,
      }),
      providesTags: ["BlockedRequests"],
    }),
    resolveBlockedSupportRequest: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/auth/blocked-support-requests/${id}/resolve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BlockedRequests", "Customers"],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyResetPasswordTokenMutation,
  useResetPasswordMutation,
  useGetCustomersQuery,
  useEditCustomerMutation,
  useDeleteCustomerMutation,
  useToggleCustomerStatusMutation,
  useGetBlockedSupportRequestsQuery,
  useResolveBlockedSupportRequestMutation,
} = authApi;
