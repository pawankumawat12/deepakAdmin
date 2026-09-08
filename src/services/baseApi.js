import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { signOut, setUser } from "../context/authSlice";
import { updateAdminSocketToken, disconnectAdminSocket } from "./socket";

class SimpleMutex {
  constructor() {
    this._queue = Promise.resolve();
    this._locked = false;
  }

  isLocked() {
    return this._locked;
  }

  async acquire() {
    this._locked = true;
    let release;
    const ticket = new Promise((resolve) => {
      release = resolve;
    });
    const wait = this._queue;
    this._queue = this._queue.then(() => ticket);
    await wait;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this._locked = false;
      release();
    };
  }

  async waitForUnlock() {
    while (this._locked) {
      await this._queue;
    }
  }
}

const mutex = new SimpleMutex();

const getNormalizedBaseUrl = () => {
  const envUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ""
  ).trim();
  if (!envUrl) return "/api/v1";
  const clean = envUrl.replace(/\/+$/, "");
  return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getNormalizedBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const accessToken = getState()?.auth?.accessToken;
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args?.url;
  const isRefreshRequest =
    url === "/auth/refresh-token" || url?.includes("refresh-token");
  const isAuthEndpoint =
    isRefreshRequest ||
    url === "/auth/logout" ||
    url === "/auth/login" ||
    url === "/auth/admin-login" ||
    url === "/auth/verify-otp";

  if (result.error?.status === 401 && !isAuthEndpoint) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await rawBaseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
          },
          api,
          extraOptions
        );

        if (
          !refreshResult.error &&
          (refreshResult.data?.accessToken || refreshResult.data?.token)
        ) {
          const newAccessToken =
            refreshResult.data.accessToken || refreshResult.data.token;

          updateAdminSocketToken(newAccessToken);

          api.dispatch(
            setUser({
              ...(refreshResult.data?.user || {}),
              accessToken: newAccessToken,
            })
          );

          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // Stop all retries immediately, clear access token and Redux auth state
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
          }
          disconnectAdminSocket();
          api.dispatch(signOut());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      // Only retry if a new token was successfully stored in Redux by the refresh call
      const tokenAfterUnlock = api.getState()?.auth?.accessToken;
      if (tokenAfterUnlock) {
        result = await rawBaseQuery(args, api, extraOptions);
      }
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
    "EmailLogs",
    "EmailTemplates",
    "HeroSliders",
    "Favourites",
    "CmsPages",
  ],
  endpoints: () => ({}),
});
