import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import catalogReducer from "./catalogSlice";
import managementReducer from "./managementSlice";

export const store = configureStore({
  reducer: { auth: authReducer, catalog: catalogReducer, management: managementReducer },
});
