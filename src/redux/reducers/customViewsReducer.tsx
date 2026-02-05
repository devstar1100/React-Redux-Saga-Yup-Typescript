/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomViewType, CustomViewGridTemplate } from "../../types/customViews";
import {
  UPDATE_ARE_GRID_TEMPLATES_LOADING,
  UPDATE_SIMULATION_CUSTOM_VIEWS,
  UPDATE_CUSTOM_VIEW_GRID_TEMPLATES,
  UPDATE_CUSTOM_VIEWS_LIST,
} from "../actions/customViewsActions";
import { StoreType } from "../types/store.types";

export interface customViewsStateType {
  simulaitonList?: CustomViewType[];
  allList?: CustomViewType[];
  gridTemplates?: CustomViewGridTemplate[];
  areGridTemplatesLoading?: boolean;
}

export const customViewsInitialState: customViewsStateType = {};

const customViewsReducer = (state = customViewsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SIMULATION_CUSTOM_VIEWS:
      return { ...state, simulaitonList: action.payload };
    case UPDATE_CUSTOM_VIEWS_LIST:
      return { ...state, allList: action.payload };
    case UPDATE_CUSTOM_VIEW_GRID_TEMPLATES:
      return { ...state, gridTemplates: action.payload };
    case UPDATE_ARE_GRID_TEMPLATES_LOADING:
      return { ...state, areGridTemplatesLoading: action.payload };
    default:
      return { ...state };
  }
};

export const getSimulationCustomViews = (state: StoreType) => state.customViews.simulaitonList;
export const getAllCustomViews = (state: StoreType) => state.customViews.allList;
export const getCustomViewGridTemplates = (state: StoreType) => state.customViews.gridTemplates;
export const getAreGridTemplatesLoading = (state: StoreType) => state.customViews.areGridTemplatesLoading;

export default customViewsReducer;
