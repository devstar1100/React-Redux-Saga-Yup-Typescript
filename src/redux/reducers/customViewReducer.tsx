/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomViewType } from "../../types/customViews";
import {
  UPDATE_CUSTOM_VIEW_DATA,
  UPDATE_IS_CUSTOM_VIEW_EDIT_MODE,
  UPDATE_IS_CUSTOM_VIEW_LOADING,
} from "../actions/customViewActions";
import { StoreType } from "../types/store.types";

export interface customViewStateType {
  data?: CustomViewType;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export const customViewInitialState: customViewStateType = {};

const customViewReducer = (state = customViewInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_CUSTOM_VIEW_DATA:
      return { ...state, data: action.payload };
    case UPDATE_IS_CUSTOM_VIEW_LOADING:
      return { ...state, isLoading: action.payload };
    case UPDATE_IS_CUSTOM_VIEW_EDIT_MODE:
      return { ...state, isEditMode: action.payload };
    default:
      return { ...state };
  }
};

export const getCurrentCustomView = (state: StoreType) => state.customView.data;
export const getIsCustomViewLoading = (state: StoreType) => state.customView.isLoading;
export const getIsCustomViewEditMode = (state: StoreType) => state.customView.isEditMode;

export default customViewReducer;
