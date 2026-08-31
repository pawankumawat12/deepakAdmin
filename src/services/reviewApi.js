import { baseApi } from "./baseApi";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminReviews: build.query({
      query: (params) => ({
        url: "/reviews/admin",
        params,
      }),
      providesTags: ["Reviews"],
    }),
    toggleReviewVisibility: build.mutation({
      query: ({ id, is_hidden }) => ({
        url: `/reviews/${id}/visibility`,
        method: "PATCH",
        body: { is_hidden },
      }),
      invalidatesTags: ["Reviews"],
    }),
    deleteReview: build.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"],
    }),
    getReviewStats: build.query({
      query: () => "/reviews/stats",
      providesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetAdminReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation,
  useGetReviewStatsQuery,
} = reviewApi;

