export const toAssetUrl = (path) => {
  if (!path || /^https?:\/\//i.test(path) || /^(?:blob:|data:)/i.test(path)) {
    return path || "";
  }
  const backendUrl = (
    import.meta.env?.VITE_BACKEND_URL ||
    import.meta.env?.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");
  return `${backendUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
