import { baseApi } from "./baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminNotifications: builder.query({
      query: (params) => ({
        url: "/notifications",
        params: params || {},
      }),
      providesTags: ["Notification"],
    }),

    getAdminUnreadCount: builder.query({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),

    markAdminNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllAdminNotificationsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    registerAdminDeviceToken: builder.mutation({
      query: (body) => ({
        url: "/notifications/admin-token",
        method: "POST",
        body,
      }),
    }),

    unregisterAdminDeviceToken: builder.mutation({
      query: (body) => ({
        url: "/notifications/admin-token",
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const {
  useGetAdminNotificationsQuery,
  useGetAdminUnreadCountQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,
  useRegisterAdminDeviceTokenMutation,
  useUnregisterAdminDeviceTokenMutation,
} = notificationApi;


