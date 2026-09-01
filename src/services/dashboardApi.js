import { baseApi } from "./baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardOverview: build.query({
      query: (params) => ({
        url: "/dashboard/overview",
        params,
      }),
      providesTags: ["Dashboard", "Order"],
    }),
    getDashboardTrends: build.query({
      query: (params) => ({
        url: "/dashboard/trends",
        params,
      }),
      providesTags: ["Dashboard", "Order"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardTrendsQuery,
} = dashboardApi;

