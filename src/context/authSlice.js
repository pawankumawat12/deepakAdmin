import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(
  localStorage.getItem("deepak-admin-user") || "null"
);
const authSlice = createSlice({
  name: "auth",
  initialState: { user: storedUser, pendingEmail: "", otpSent: false },
  reducers: {
    requestOtp: (state, action) => {
      state.pendingEmail = action.payload;
      state.otpSent = true;
    },
    signIn: (state, action) => {
      state.user = {
        name: "Deepak Admin",
        email: action.payload,
        role: "Super Admin",
      };
      state.otpSent = false;
      localStorage.setItem("deepak-admin-user", JSON.stringify(state.user));
    },
    signOut: (state) => {
      state.user = null;
      state.pendingEmail = "";
      localStorage.removeItem("deepak-admin-user");
    },
  },
});
export const { requestOtp, signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
