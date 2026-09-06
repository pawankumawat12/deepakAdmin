import { baseApi } from "./baseApi";

const createCategoryFormData = (
  { imageFile, status, parentCategoryId, ...category },
  includeParentReset = false
) => {
  const formData = new FormData();

  Object.entries({
    ...category,
    isActive: status === "Active",
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (parentCategoryId) {
    formData.append("parentCategoryId", parentCategoryId);
  } else if (includeParentReset) {
    formData.append("parentCategoryId", "null");
  }

  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  return formData;
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query({
      query: (params = {}) => ({
        url: "/categories",
        params: { limit: 10, ...params },
      }),
      providesTags: (result) => [
        "Category",
        ...(result?.data || []).map(({ id }) => ({ type: "Category", id })),
      ],
    }),
    getCategory: build.query({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),
    createCategory: build.mutation({
      query: (category) => ({
        url: "/categories",
        method: "POST",
        body: createCategoryFormData(category),
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: build.mutation({
      query: ({ id, ...category }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: createCategoryFormData(category, true),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Category",
        { type: "Category", id },
      ],
    }),
    deleteCategory: build.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
    bulkUpdateCategoryStatus: build.mutation({
      query: ({ ids, isActive }) => ({
        url: "/categories/bulk-status",
        method: "POST",
        body: { ids, isActive },
      }),
      invalidatesTags: ["Category"],
    }),
    bulkDeleteCategories: build.mutation({
      query: ({ ids }) => ({
        url: "/categories/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useBulkUpdateCategoryStatusMutation,
  useBulkDeleteCategoriesMutation,
} = categoryApi;
