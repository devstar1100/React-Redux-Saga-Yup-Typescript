/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoreType } from "../types/store.types";
import { ConfigurationFile } from "../../types/configurationFile";
import {
  UPDATE_CONFIGURATION_FILES,
  UPDATE_CONFIGURATION_FILES_LOADING,
  UPDATE_CONFIG_FILE_VALIDATION_ERRORS,
} from "../actions/configurationFilesActions";
import { ValidationError } from "../../types/validationError";

export interface configurationFilesStateType {
  list: ConfigurationFile[];
  validationErrors: ValidationError[];
  isLoading: boolean;
}

export const simulationsInitialState: configurationFilesStateType = {
  list: [],
  validationErrors: [],
  isLoading: false,
};

const configurationFilesReducer = (state = simulationsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_CONFIGURATION_FILES:
      return { ...state, list: action.payload };
    case UPDATE_CONFIG_FILE_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];

      return { ...state, validationErrors };
    }
    case UPDATE_CONFIGURATION_FILES_LOADING: {
      return { ...state, isLoading: action.payload };
    }
    default:
      return { ...state };
  }
};

export const getConfigurationFiles = (state: StoreType) => state.configurationFiles.list;
export const getConfigFileValidationErrors = (state: StoreType) => state.configurationFiles.validationErrors;
export const getConfigurationFilesLoading = (state: StoreType) => state.configurationFiles.isLoading;

export default configurationFilesReducer;
