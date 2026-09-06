import { baseApi } from "./baseApi";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminOrders: build.query({
      query: (params = {}) => ({
        url: "/orders/admin/all",
        params: { limit: 20, ...params },
      }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
    markItemProduced: build.mutation({
      query: ({ itemId, productionStatus = "PRODUCED" }) => ({
        url: `/orders/items/${itemId}/produced`,
        method: "PATCH",
        body: { productionStatus },
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrderPaymentStatus: build.mutation({
      query: ({ id, paymentStatus }) => ({
        url: `/orders/${id}/payment-status`,
        method: "PATCH",
        body: { paymentStatus },
      }),
      invalidatesTags: ["Order"],
    }),
    acceptOrder: build.mutation({
      query: ({ id, paymentStatus, notes }) => ({
        url: `/orders/${id}/accept`,
        method: "POST",
        body: { paymentStatus, notes },
      }),
      invalidatesTags: ["Order"],
    }),
    rejectOrder: build.mutation({
      query: ({ id, cancelReason }) => ({
        url: `/orders/${id}/reject`,
        method: "POST",
        body: { cancelReason },
      }),
      invalidatesTags: ["Order", "Product"],
    }),
    getAdminOrderById: build.query({
      query: (id) => `/orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Order", id }],
    }),
    bulkUpdateOrderStatus: build.mutation({
      query: ({ ids, status, cancelReason }) => ({
        url: "/orders/bulk-status",
        method: "POST",
        body: { ids, status, cancelReason },
      }),
      invalidatesTags: ["Order", "Product"],
    }),
  }),
});

export const {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useBulkUpdateOrderStatusMutation,
  useMarkItemProducedMutation,
  useUpdateOrderPaymentStatusMutation,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useGetAdminOrderByIdQuery,
} = orderApi;

