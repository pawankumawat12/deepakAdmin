import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, accessToken: null },
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload;
      if (payload) {
        state.user = payload.user || payload;
        state.accessToken = payload.accessToken || payload.token || state.accessToken;
      }
    },
    
    signOut: (state) => {
      state.user = null;
      state.accessToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  },
});
export const { setUser, signOut } = authSlice.actions;
export default authSlice.reducer;
