import { baseApi } from "./baseApi";
import { setUser, signOut } from "../context/authSlice";

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
      query: (payload) => ({
        url: "/auth/send-otp",
        method: "POST",
        body:
          typeof payload === "string"
            ? { email: payload, role: "admin", type: "login" }
            : { role: "admin", type: "login", ...payload },
      }),
    }),
    verifyOtp: build.mutation({
      query: (payload) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.accessToken || data?.token || data?.user?.token;
          if (token && typeof window !== "undefined") {
            localStorage.setItem("accessToken", token);
          }
          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch {
          // Handled in component
        }
      },
      invalidatesTags: ["Auth"],
    }),
    getMe: build.query({
      query: () => ({ url: "/auth/me" }),
      providesTags: ["Auth"],
    }),
    logout: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        dispatch(signOut());
        try {
          await queryFulfilled;
        } catch {}
      },
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
    updateProfile: build.mutation({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.user) {
            dispatch(setUser(data.user));
          }
        } catch {}
      },
      invalidatesTags: ["Auth"],
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
  useUpdateProfileMutation,
} = authApi;
