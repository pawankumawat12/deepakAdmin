import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { signOut, setUser } from "../context/authSlice";

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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  credentials: "include",
  prepareHeaders: (headers) => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
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
  const isRefreshRequest = url === "/auth/refresh-token";
  const isLogoutRequest = url === "/auth/logout";

  if (
    result.error?.status === 401 &&
    !isRefreshRequest &&
    !isLogoutRequest
  ) {
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

        if (!refreshResult.error && (refreshResult.data?.accessToken || refreshResult.data?.token)) {
          const newAccessToken =
            refreshResult.data.accessToken || refreshResult.data.token;

          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
          }

          if (refreshResult.data?.user) {
            api.dispatch(setUser(refreshResult.data.user));
          }

          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem("accessToken");
          api.dispatch(signOut());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
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
