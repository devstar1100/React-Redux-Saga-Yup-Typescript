import { ISidebarItemsState } from "../../types/ISidebarItemsState";

export const REHYDRATE = "persist/REHYDRATE";
export const SET_SIDEBAR_ITEMS_STATE = "SET_SIDEBAR_ITEMS_STATE";

export const updateSidebarItemsState = (value: ISidebarItemsState) => ({
  type: SET_SIDEBAR_ITEMS_STATE,
  payload: value,
});
