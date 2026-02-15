/* eslint-disable @typescript-eslint/no-explicit-any */
import { MonteCarloFile } from "../../types/monteCarloFile";
import { ValidationError } from "../../types/validationError";
import { StoreType } from "../types/store.types";
import {
  UPDATE_MONTECARLO_FILES_DATA,
  UPDATE_IS_MONTECARLO_FILES_LOADING,
  UPDATE_IS_MONTECARLO_FILES_EDIT_MODE,
} from "../actions/monteCarloFilesActions";

export interface monteCarloFilesStateType {
  data: MonteCarloFile[];
  isLoading: boolean;
  isEditMode: boolean;
  validationErrors: ValidationError[];
}

export const MonteCarloFilesInitialState: monteCarloFilesStateType = {
  data: [],
  validationErrors: [],
  isLoading: false,
  isEditMode: false,
};

const monteCarloFilesReducer = (state = MonteCarloFilesInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_MONTECARLO_FILES_DATA:
      return { ...state, data: action.payload };
    case UPDATE_IS_MONTECARLO_FILES_LOADING:
      return { ...state, isLoading: action.payload };
    case UPDATE_IS_MONTECARLO_FILES_EDIT_MODE:
      return { ...state, isEditMode: action.payload };
    default:
      return { ...state };
  }
};

export const getCurrentMonteCarloFiles = (state: StoreType) => state.monteCarloFiles.data;
export const getIsMonteCarloFilesLoading = (state: StoreType) => state.monteCarloFiles.isLoading;

export default monteCarloFilesReducer;
