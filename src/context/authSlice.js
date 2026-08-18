import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
    },
    signOut: (state) => {
      state.user = null;
    },
  },
});
export const { setUser, signOut } = authSlice.actions;
export default authSlice.reducer;
