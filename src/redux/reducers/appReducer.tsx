/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISidebarItemsState } from "../../types/ISidebarItemsState";
import { REHYDRATE, SET_SIDEBAR_ITEMS_STATE } from "../actions/appActions";
import { StoreType } from "../types/store.types";

export interface appStateType {
  isHydrated: boolean;
  sidebarItemsState: ISidebarItemsState;
}

export const appInitialState: appStateType = {
  isHydrated: false,
  sidebarItemsState: {},
};

const appReducer = (state = appInitialState, action: any) => {
  switch (action.type) {
    case REHYDRATE:
      return {
        ...state,
        isHydrated: true,
      };
    case SET_SIDEBAR_ITEMS_STATE:
      return {
        ...state,
        sidebarItemsState: { ...state.sidebarItemsState, ...action.payload },
      };
    default:
      return { ...state };
  }
};

export const getIsHydrated = (state: StoreType) => state.app.isHydrated;
export const getSidebarItemsState = (state: StoreType) => state.app.sidebarItemsState;

export default appReducer;
