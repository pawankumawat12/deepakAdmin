import { baseApi } from "./baseApi";

export const whyChooseUsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminWhyChooseUs: build.query({
      query: (params = {}) => ({
        url: "/why-choose-us/admin",
        params: { page: 1, limit: 50, ...params },
      }),
      providesTags: (result) => [
        { type: "WhyChooseUs", id: "LIST" },
        ...(result?.data?.items || []).map(({ id }) => ({
          type: "WhyChooseUs",
          id,
        })),
      ],
    }),

    getWhyChooseUsItem: build.query({
      query: (id) => `/why-choose-us/${id}`,
      providesTags: (_result, _error, id) => [{ type: "WhyChooseUs", id }],
    }),

    createWhyChooseUs: build.mutation({
      query: (formData) => ({
        url: "/why-choose-us",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "WhyChooseUs", id: "LIST" }],
    }),

    updateWhyChooseUs: build.mutation({
      query: ({ id, formData }) => ({
        url: `/why-choose-us/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "WhyChooseUs", id: "LIST" },
        { type: "WhyChooseUs", id },
      ],
    }),

    toggleWhyChooseUsStatus: build.mutation({
      query: ({ id, is_active }) => ({
        url: `/why-choose-us/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "WhyChooseUs", id: "LIST" },
        { type: "WhyChooseUs", id },
      ],
    }),

    reorderWhyChooseUs: build.mutation({
      query: (items) => ({
        url: "/why-choose-us/reorder",
        method: "PATCH",
        body: { items },
      }),
      invalidatesTags: [{ type: "WhyChooseUs", id: "LIST" }],
    }),

    deleteWhyChooseUs: build.mutation({
      query: (id) => ({
        url: `/why-choose-us/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "WhyChooseUs", id: "LIST" }],
    }),

    getWhyChooseUsSettings: build.query({
      query: () => "/why-choose-us/settings",
      providesTags: [{ type: "WhyChooseUs", id: "SETTINGS" }],
    }),

    updateWhyChooseUsSettings: build.mutation({
      query: (data) => ({
        url: "/why-choose-us/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: "WhyChooseUs", id: "LIST" },
        { type: "WhyChooseUs", id: "SETTINGS" },
      ],
    }),
  }),
});

export const {
  useGetAdminWhyChooseUsQuery,
  useGetWhyChooseUsItemQuery,
  useCreateWhyChooseUsMutation,
  useUpdateWhyChooseUsMutation,
  useToggleWhyChooseUsStatusMutation,
  useReorderWhyChooseUsMutation,
  useDeleteWhyChooseUsMutation,
  useGetWhyChooseUsSettingsQuery,
  useUpdateWhyChooseUsSettingsMutation,
} = whyChooseUsApi;
