import { baseApi } from "./baseApi";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Suppliers
    getSuppliers: build.query({
      query: (params = {}) => ({
        url: "/inventory/suppliers",
        params: { limit: 100, ...params },
      }),
      providesTags: (result) => [
        "Suppliers",
        ...(result?.data || []).map(({ id }) => ({ type: "Suppliers", id })),
      ],
    }),
    getSupplier: build.query({
      query: (id) => `/inventory/suppliers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Suppliers", id }],
    }),
    createSupplier: build.mutation({
      query: (body) => ({
        url: "/inventory/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Suppliers"],
    }),
    updateSupplier: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Suppliers",
        { type: "Suppliers", id },
        "Ingredients",
      ],
    }),
    deleteSupplier: build.mutation({
      query: (id) => ({
        url: `/inventory/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Suppliers", "Ingredients"],
    }),

    // Ingredients
    getIngredients: build.query({
      query: (params = {}) => ({
        url: "/inventory/ingredients",
        params: { limit: 100, ...params },
      }),
      providesTags: (result) => [
        "Ingredients",
        ...(result?.data || []).map(({ id }) => ({ type: "Ingredients", id })),
      ],
    }),
    getIngredient: build.query({
      query: (id) => `/inventory/ingredients/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Ingredients", id }],
    }),
    createIngredient: build.mutation({
      query: (body) => ({
        url: "/inventory/ingredients",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ingredients", "InventoryLogs"],
    }),
    updateIngredient: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/ingredients/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Ingredients",
        { type: "Ingredients", id },
        "Recipes",
      ],
    }),
    adjustIngredientStock: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/ingredients/${id}/adjust-stock`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Ingredients",
        { type: "Ingredients", id },
        "InventoryLogs",
      ],
    }),
    deleteIngredient: build.mutation({
      query: (id) => ({
        url: `/inventory/ingredients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ingredients"],
    }),
    getLowStockIngredients: build.query({
      query: () => "/inventory/ingredients/low-stock",
      providesTags: ["Ingredients"],
    }),

    // Recipes (BOM)
    getProductRecipe: build.query({
      query: (productId) => `/inventory/recipes/product/${productId}`,
      providesTags: (_result, _error, productId) => [
        "Recipes",
        { type: "Recipes", id: productId },
      ],
    }),
    saveProductRecipe: build.mutation({
      query: ({ productId, ingredients }) => ({
        url: `/inventory/recipes/product/${productId}`,
        method: "PUT",
        body: { ingredients },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        "Recipes",
        { type: "Recipes", id: productId },
      ],
    }),
    deleteProductIngredient: build.mutation({
      query: ({ productId, ingredientId }) => ({
        url: `/inventory/recipes/product/${productId}/ingredient/${ingredientId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        "Recipes",
        { type: "Recipes", id: productId },
      ],
    }),

    // Logs
    getStockLogs: build.query({
      query: (params = {}) => ({
        url: "/inventory/logs",
        params: { limit: 50, ...params },
      }),
      providesTags: ["InventoryLogs"],
    }),
  }),
});

export const {
  // Suppliers
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,

  // Ingredients
  useGetIngredientsQuery,
  useGetIngredientQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useAdjustIngredientStockMutation,
  useDeleteIngredientMutation,
  useGetLowStockIngredientsQuery,

  // Recipes
  useGetProductRecipeQuery,
  useSaveProductRecipeMutation,
  useDeleteProductIngredientMutation,

  // Logs
  useGetStockLogsQuery,
} = inventoryApi;

