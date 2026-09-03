import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload?.user || action.payload;
    },
    signOut: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  },
});
export const { setUser, signOut } = authSlice.actions;
export default authSlice.reducer;
