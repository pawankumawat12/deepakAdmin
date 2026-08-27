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
  }),
});

export const {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useMarkItemProducedMutation,
} = orderApi;

