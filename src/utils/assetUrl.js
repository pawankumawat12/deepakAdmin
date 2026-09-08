export const toAssetUrl = (path) => {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed) || /^(?:blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\\/g, "/");
  const backendUrl = (
    import.meta.env?.VITE_BACKEND_URL ||
    import.meta.env?.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");

  const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${backendUrl}${clean}`;
};

export default toAssetUrl;
