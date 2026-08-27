import { baseApi } from "./baseApi";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTheme: build.query({
      query: () => "/settings/theme",
      providesTags: ["Settings"],
    }),
    updateTheme: build.mutation({
      query: (body) => ({
        url: "/settings/theme",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetThemeQuery, useUpdateThemeMutation } = settingsApi;
