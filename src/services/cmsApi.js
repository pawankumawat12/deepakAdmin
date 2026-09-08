import { baseApi } from "./baseApi";

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminCmsPages: build.query({
      query: (params = {}) => ({
        url: "/cms/admin/pages",
        params: { page: 1, limit: 10, ...params },
      }),
      providesTags: (result) => [
        { type: "CmsPages", id: "LIST" },
        ...(result?.data || []).map(({ id }) => ({ type: "CmsPages", id })),
      ],
    }),
    getAdminCmsPageById: build.query({
      query: (id) => `/cms/admin/pages/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CmsPages", id }],
    }),
    createAdminCmsPage: build.mutation({
      query: (body) => ({
        url: "/cms/admin/pages",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CmsPages", id: "LIST" }],
    }),
    updateAdminCmsPage: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/cms/admin/pages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CmsPages", id: "LIST" },
        { type: "CmsPages", id },
      ],
    }),
    deleteAdminCmsPage: build.mutation({
      query: (id) => ({
        url: `/cms/admin/pages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CmsPages", id: "LIST" }],
    }),
    bulkStatusAdminCmsPages: build.mutation({
      query: (body) => ({
        url: "/cms/admin/pages/bulk-status",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CmsPages", id: "LIST" }],
    }),
    bulkDeleteAdminCmsPages: build.mutation({
      query: (body) => ({
        url: "/cms/admin/pages/bulk-delete",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CmsPages", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminCmsPagesQuery,
  useGetAdminCmsPageByIdQuery,
  useCreateAdminCmsPageMutation,
  useUpdateAdminCmsPageMutation,
  useDeleteAdminCmsPageMutation,
  useBulkStatusAdminCmsPagesMutation,
  useBulkDeleteAdminCmsPagesMutation,
} = cmsApi;

