import { baseApi } from "./baseApi";

export const emailTemplateApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEmailTemplates: build.query({
      query: (params = {}) => ({
        url: "/email-templates",
        params: { page: 1, limit: 10, ...params },
      }),
      providesTags: (result) => [
        { type: "EmailTemplates", id: "LIST" },
        ...(result?.data || []).map(({ id }) => ({ type: "EmailTemplates", id })),
      ],
    }),
    getEmailTemplate: build.query({
      query: (id) => `/email-templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: "EmailTemplates", id }],
    }),
    createEmailTemplate: build.mutation({
      query: (body) => ({
        url: "/email-templates",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "EmailTemplates", id: "LIST" }],
    }),
    updateEmailTemplate: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/email-templates/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "EmailTemplates", id: "LIST" },
        { type: "EmailTemplates", id },
      ],
    }),
    deleteEmailTemplate: build.mutation({
      query: (id) => ({ url: `/email-templates/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "EmailTemplates", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} = emailTemplateApi;
