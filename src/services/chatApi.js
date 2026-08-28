import { baseApi } from "./baseApi";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminOrderMessages: build.query({
      query: (orderId) => `/chat/orders/${orderId}/messages`,
      providesTags: (_res, _err, id) => [{ type: "Chat", id }],
    }),
    postAdminOrderMessage: build.mutation({
      query: (arg) => {
        if (arg instanceof FormData) {
          const orderId = arg.get("orderId");
          return {
            url: `/chat/orders/${orderId}/messages`,
            method: "POST",
            body: arg,
          };
        }
        const { orderId, ...body } = arg;
        return {
          url: `/chat/orders/${orderId}/messages`,
          method: "POST",
          body: { ...body, senderRole: "admin" },
        };
      },
      invalidatesTags: (_res, _err, arg) => {
        const id = arg instanceof FormData ? arg.get("orderId") : arg?.orderId;
        return [{ type: "Chat", id }];
      },
    }),
    markAdminOrderMessagesRead: build.mutation({
      query: (orderId) => ({
        url: `/chat/orders/${orderId}/messages/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [{ type: "Chat", id }],
    }),
  }),
});

export const {
  useGetAdminOrderMessagesQuery,
  usePostAdminOrderMessageMutation,
  useMarkAdminOrderMessagesReadMutation,
} = chatApi;

