import { baseApi } from "./baseApi";

export const emailLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailLogs: builder.query({
      query: (params) => ({
        url: "/email-logs",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "EmailLogs", id })),
              { type: "EmailLogs", id: "LIST" },
            ]
          : [{ type: "EmailLogs", id: "LIST" }],
    }),

    getEmailLogStats: builder.query({
      query: () => "/email-logs/stats",
      providesTags: [{ type: "EmailLogs", id: "STATS" }],
    }),

    getEmailLogById: builder.query({
      query: (id) => `/email-logs/${id}`,
      providesTags: (result, error, id) => [{ type: "EmailLogs", id }],
    }),

    deleteEmailLog: builder.mutation({
      query: (id) => ({
        url: `/email-logs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "EmailLogs", id: "LIST" },
        { type: "EmailLogs", id: "STATS" },
      ],
    }),

    bulkDeleteEmailLogs: builder.mutation({
      query: (ids) => ({
        url: "/email-logs/bulk",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: [
        { type: "EmailLogs", id: "LIST" },
        { type: "EmailLogs", id: "STATS" },
      ],
    }),
  }),
});

export const {
  useGetEmailLogsQuery,
  useGetEmailLogStatsQuery,
  useGetEmailLogByIdQuery,
  useLazyGetEmailLogByIdQuery,
  useDeleteEmailLogMutation,
  useBulkDeleteEmailLogsMutation,
} = emailLogApi;

