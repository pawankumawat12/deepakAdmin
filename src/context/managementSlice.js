import { createSlice, nanoid } from "@reduxjs/toolkit";
const initialState = {
  customers: [
    {
      id: "cu-1",
      name: "Priya Sharma",
      email: "priya@example.com",
      orders: "12",
      total: "₹4,820",
    },
    {
      id: "cu-2",
      name: "Rohan Mehta",
      email: "rohan@example.com",
      orders: "8",
      total: "₹2,940",
    },
  ],
  offers: [
    {
      id: "of-1",
      title: "Welcome offer",
      code: "WELCOME20",
      discount: "20% off",
      status: "Active",
    },
    {
      id: "of-2",
      title: "Weekend special",
      code: "WEEKEND15",
      discount: "15% off",
      status: "Active",
    },
  ],
  reviews: [
    {
      id: "re-1",
      customer: "Priya Sharma",
      rating: "5",
      comment: "Delicious food and fast delivery.",
      status: "Published",
    },
    {
      id: "re-2",
      customer: "Rohan Mehta",
      rating: "4",
      comment: "Great paneer butter masala.",
      status: "Published",
    },
  ],
  messages: [
    {
      id: "me-1",
      customer: "Priya Sharma",
      subject: "Order update",
      message: "Can I change delivery time?",
      status: "Unread",
    },
    {
      id: "me-2",
      customer: "Rohan Mehta",
      subject: "Feedback",
      message: "Loved the food!",
      status: "Read",
    },
  ],
  favourites: [
    {
      id: "fa-1",
      product: "Paneer Butter Masala",
      category: "Main course",
      favourites: "342",
      rating: "4.9",
    },
    {
      id: "fa-2",
      product: "Classic Butter Naan",
      category: "Breads",
      favourites: "286",
      rating: "4.8",
    },
  ],
  settings: [
    {
      id: "se-1",
      setting: "Store status",
      value: "Open for orders",
      status: "Active",
    },
    { id: "se-2", setting: "Delivery radius", value: "8 km", status: "Active" },
  ],
};
const managementSlice = createSlice({
  name: "management",
  initialState,
  reducers: {
    createRecord: {
      reducer: (state, action) => {
        state[action.payload.type].unshift(action.payload.record);
      },
      prepare: ({ type, record }) => ({
        payload: { type, record: { ...record, id: nanoid() } },
      }),
    },
    updateRecord: (state, action) => {
      const { type, record } = action.payload;
      const index = state[type].findIndex((item) => item.id === record.id);
      if (index >= 0) state[type][index] = { ...state[type][index], ...record };
    },
    deleteRecord: (state, action) => {
      const { type, id } = action.payload;
      state[type] = state[type].filter((item) => item.id !== id);
    },
  },
});
export const { createRecord, updateRecord, deleteRecord } =
  managementSlice.actions;
export default managementSlice.reducer;
