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
    getFooter: build.query({
      query: () => "/settings/footer",
      providesTags: ["Settings"],
    }),
    updateFooter: build.mutation({
      query: (body) => ({
        url: "/settings/footer",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
    getLogo: build.query({
      query: () => "/settings/logo",
      providesTags: ["Settings"],
    }),
    updateLogo: build.mutation({
      query: (formData) => ({
        url: "/settings/logo",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Settings"],
    }),

    getSettingPricing: build.query({
      query: () => '/settings/order-pricing',
      providesTags: ["Settings"],
    }),
    updateSettingPricing: build.mutation({
      query: (body) => ({
        url: "/settings/order-pricing",
        method: "PUT",
        body
      }),
      invalidatesTags: ["Settings"],
    }),
    getPaymentQr: build.query({
      query: () => '/settings/payment-qr',
      providesTags: ["Settings"],
    }),
    updatePaymentQr: build.mutation({
      query: (formDataOrBody) => ({
        url: "/settings/payment-qr",
        method: "PUT",
        body: formDataOrBody,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetThemeQuery,
  useUpdateThemeMutation,
  useGetFooterQuery,
  useUpdateFooterMutation,
  useGetLogoQuery,
  useUpdateLogoMutation,
  useGetSettingPricingQuery,
  useUpdateSettingPricingMutation,
  useGetPaymentQrQuery,
  useUpdatePaymentQrMutation,
} = settingsApi;
