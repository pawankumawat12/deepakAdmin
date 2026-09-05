import { baseApi } from "./baseApi";

export const heroSliderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminHeroSliders: build.query({
      query: (params = {}) => ({
        url: "/hero-sliders/admin",
        params: { page: 1, limit: 50, ...params },
      }),
      providesTags: (result) => [
        { type: "HeroSliders", id: "LIST" },
        ...(result?.data?.sliders || []).map(({ id }) => ({
          type: "HeroSliders",
          id,
        })),
      ],
    }),

    getHeroSlider: build.query({
      query: (id) => `/hero-sliders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "HeroSliders", id }],
    }),

    createHeroSlider: build.mutation({
      query: (formData) => ({
        url: "/hero-sliders",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "HeroSliders", id: "LIST" }],
    }),

    updateHeroSlider: build.mutation({
      query: ({ id, formData }) => ({
        url: `/hero-sliders/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "HeroSliders", id: "LIST" },
        { type: "HeroSliders", id },
      ],
    }),

    toggleHeroSliderStatus: build.mutation({
      query: ({ id, is_active }) => ({
        url: `/hero-sliders/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "HeroSliders", id: "LIST" },
        { type: "HeroSliders", id },
      ],
    }),

    reorderHeroSliders: build.mutation({
      query: (items) => ({
        url: "/hero-sliders/reorder",
        method: "PATCH",
        body: { items },
      }),
      invalidatesTags: [{ type: "HeroSliders", id: "LIST" }],
    }),

    deleteHeroSlider: build.mutation({
      query: (id) => ({
        url: `/hero-sliders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "HeroSliders", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminHeroSlidersQuery,
  useGetHeroSliderQuery,
  useCreateHeroSliderMutation,
  useUpdateHeroSliderMutation,
  useToggleHeroSliderStatusMutation,
  useReorderHeroSlidersMutation,
  useDeleteHeroSliderMutation,
} = heroSliderApi;

