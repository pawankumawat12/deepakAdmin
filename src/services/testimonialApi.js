import { baseApi } from "./baseApi";

export const testimonialApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminTestimonials: build.query({
      query: (params = {}) => ({
        url: "/testimonials/admin",
        params: { page: 1, limit: 50, ...params },
      }),
      providesTags: (result) => [
        { type: "Testimonials", id: "LIST" },
        ...(result?.data?.testimonials || []).map(({ id }) => ({
          type: "Testimonials",
          id,
        })),
      ],
    }),

    getTestimonialItem: build.query({
      query: (id) => `/testimonials/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Testimonials", id }],
    }),

    createTestimonial: build.mutation({
      query: (formData) => ({
        url: "/testimonials",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Testimonials", id: "LIST" }],
    }),

    updateTestimonial: build.mutation({
      query: ({ id, formData }) => ({
        url: `/testimonials/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Testimonials", id: "LIST" },
        { type: "Testimonials", id },
      ],
    }),

    toggleTestimonialStatus: build.mutation({
      query: ({ id, is_active }) => ({
        url: `/testimonials/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Testimonials", id: "LIST" },
        { type: "Testimonials", id },
      ],
    }),

    reorderTestimonials: build.mutation({
      query: (items) => ({
        url: "/testimonials/reorder",
        method: "PATCH",
        body: { items },
      }),
      invalidatesTags: [{ type: "Testimonials", id: "LIST" }],
    }),

    deleteTestimonial: build.mutation({
      query: (id) => ({
        url: `/testimonials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Testimonials", id: "LIST" }],
    }),

    getTestimonialSettings: build.query({
      query: () => "/testimonials/settings",
      providesTags: [{ type: "Testimonials", id: "SETTINGS" }],
    }),

    updateTestimonialSettings: build.mutation({
      query: (data) => ({
        url: "/testimonials/settings",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: "Testimonials", id: "LIST" },
        { type: "Testimonials", id: "SETTINGS" },
      ],
    }),
  }),
});

export const {
  useGetAdminTestimonialsQuery,
  useGetTestimonialItemQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useToggleTestimonialStatusMutation,
  useReorderTestimonialsMutation,
  useDeleteTestimonialMutation,
  useGetTestimonialSettingsQuery,
  useUpdateTestimonialSettingsMutation,
} = testimonialApi;
