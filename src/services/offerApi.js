import { baseApi } from "./baseApi";

export const offerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminOffers: build.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page);
        if (params?.limit) searchParams.append("limit", params.limit);
        if (params?.search) searchParams.append("search", params.search);
        if (params?.status && params.status !== "all") searchParams.append("status", params.status);
        if (params?.type && params.type !== "all") searchParams.append("type", params.type);
        const qStr = searchParams.toString();
        return `/offers/admin${qStr ? `?${qStr}` : ""}`;
      },
      providesTags: ["Offers"],
    }),
    getOfferById: build.query({
      query: (id) => `/offers/${id}`,
      providesTags: (result, error, id) => [{ type: "Offers", id }],
    }),
    createOffer: build.mutation({
      query: (body) => {
        const isFormData = body instanceof FormData;
        return {
          url: "/offers",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Offers"],
    }),
    updateOffer: build.mutation({
      query: ({ id, body }) => ({
        url: `/offers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Offers"],
    }),
    toggleOfferStatus: build.mutation({
      query: ({ id, is_active }) => ({
        url: `/offers/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: ["Offers"],
    }),
    deleteOffer: build.mutation({
      query: (id) => ({
        url: `/offers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offers"],
    }),
  }),
});

export const {
  useGetAdminOffersQuery,
  useGetOfferByIdQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useToggleOfferStatusMutation,
  useDeleteOfferMutation,
} = offerApi;

