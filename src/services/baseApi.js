import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  credentials: "include",
  prepareHeaders: (headers) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args?.url;

  const isRefreshRequest = url === "/auth/refresh-token";
  const isLogoutRequest = url === "/auth/logout";

  if (
    result.error?.status === 401 &&
    !isRefreshRequest &&
    !isLogoutRequest
  ) {
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (!refreshResult.error) {
      const newAccessToken = refreshResult.data?.accessToken;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
      }

      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Product",
    "Category",
    "Settings",
    "Order",
    "Chat",
    "Offers",
    "Contact",
    "Notification",
    "Dashboard",
  ],
  endpoints: () => ({}),
});
