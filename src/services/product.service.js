import { api } from "./api";
export const productService = {
  list: () => api.get("/products"),
  create: (payload) => api.post("/products", payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
};
