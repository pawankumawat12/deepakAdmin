import { baseApi } from "./baseApi";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactQueries: builder.query({
      query: (params) => ({
        url: "/contact/admin",
        params,
      }),
      providesTags: ["Contact"],
    }),

    getContactStats: builder.query({
      query: () => "/contact/admin/stats",
      providesTags: ["Contact"],
    }),

    updateContactQuery: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/contact/admin/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Contact"],
    }),

    deleteContactQuery: builder.mutation({
      query: (id) => ({
        url: `/contact/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetContactQueriesQuery,
  useGetContactStatsQuery,
  useUpdateContactQueryMutation,
  useDeleteContactQueryMutation,
} = contactApi;

