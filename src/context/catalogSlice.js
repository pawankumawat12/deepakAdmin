import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  categories: [
    { id: 'cat-breads', name: 'Breads', description: 'Fresh tandoor breads', status: 'Active' },
    { id: 'cat-main', name: 'Main course', description: 'Signature curries and meals', status: 'Active' },
    { id: 'cat-beverages', name: 'Beverages', description: 'Hot and cold drinks', status: 'Active' },
    { id: 'cat-desserts', name: 'Desserts', description: 'Sweet endings', status: 'Active' },
  ],
  products: [
    { id: 'prod-naan', name: 'Classic Butter Naan', categoryId: 'cat-breads', price: 45, stock: 128, status: 'Active', image: '' },
    { id: 'prod-paneer', name: 'Paneer Butter Masala', categoryId: 'cat-main', price: 280, stock: 43, status: 'Active', image: '' },
    { id: 'prod-chai', name: 'Masala Chai', categoryId: 'cat-beverages', price: 60, stock: 86, status: 'Active', image: '' },
    { id: 'prod-jamun', name: 'Gulab Jamun', categoryId: 'cat-desserts', price: 120, stock: 0, status: 'Out of stock', image: '' },
  ],
}

const catalogSlice = createSlice({
  name: 'catalog', initialState,
  reducers: {
    createProduct: { reducer: (state, action) => { state.products.unshift(action.payload) }, prepare: (product) => ({ payload: { ...product, id: nanoid(), image: '' } }) },
    updateProduct: (state, action) => { const index = state.products.findIndex((item) => item.id === action.payload.id); if (index >= 0) state.products[index] = { ...state.products[index], ...action.payload } },
    deleteProduct: (state, action) => { state.products = state.products.filter((item) => item.id !== action.payload) },
    createCategory: { reducer: (state, action) => { state.categories.unshift(action.payload) }, prepare: (category) => ({ payload: { ...category, id: nanoid() } }) },
    updateCategory: (state, action) => { const index = state.categories.findIndex((item) => item.id === action.payload.id); if (index >= 0) state.categories[index] = { ...state.categories[index], ...action.payload } },
    deleteCategory: (state, action) => { state.categories = state.categories.filter((item) => item.id !== action.payload); state.products = state.products.filter((item) => item.categoryId !== action.payload) },
  },
})

export const { createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory } = catalogSlice.actions
export default catalogSlice.reducer
