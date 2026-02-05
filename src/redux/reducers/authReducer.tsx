/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserData, UserRole, UserStatus } from "../../types/auth";
import { REHYDRATE } from "../actions/appActions";
import { UPDATE_AUTH_DATA } from "../actions/authActions";
import { StoreType } from "../types/store.types";

interface CustomAuthState {
  isAuthorized: boolean;
  isLoading: boolean;
}

export type authStateType = UserData & CustomAuthState;

export const authInitialState: authStateType = {
  "user-id": -1,
  "user-name": "",
  "first-name": "",
  "last-name": "",
  "user-role": UserRole.guest,
  "user-status": UserStatus.active,
  "access-token": "",
  "last-login-date": "",
  isAuthorized: false,
  isLoading: false,
};

const authReducer = (state = authInitialState, action: any) => {
  switch (action.type) {
    case REHYDRATE: {
      if (action?.payload?.auth) return { ...state, ...action.payload.auth };
      return { ...state };
    }
    case UPDATE_AUTH_DATA:
      return { ...state, ...action.payload };
    default:
      return { ...state };
  }
};

export const getUserData = (state: StoreType) => state.auth;
export const getIsAuthorized = (state: StoreType) => state.auth.isAuthorized;
export const getIsAuthLoading = (state: StoreType) => state.auth.isLoading;

export default authReducer;
