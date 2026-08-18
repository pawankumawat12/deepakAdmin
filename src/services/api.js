/** Shared API client placeholder. Replace mock methods with fetch/axios when the backend is connected. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const api = {
  get: async () => ({ data: null }),
  post: async (_url, body) => ({ data: body }),
  put: async (_url, body) => ({ data: body }),
  delete: async () => ({ data: null }),
}
