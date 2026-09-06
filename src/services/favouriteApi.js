import { baseApi } from "./baseApi";

export const favouriteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminFavourites: build.query({
      query: (params) => ({
        url: "/wishlist/admin/favourites",
        params,
      }),
      providesTags: ["Favourites", "Product"],
    }),
  }),
});

export const { useGetAdminFavouritesQuery } = favouriteApi;

