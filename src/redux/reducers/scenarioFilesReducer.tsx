/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScenarioFile } from "../../types/scenarioFile";
import { ValidationError } from "../../types/validationError";
import {
  UPDATE_SCENARIO_FILES_DATA,
  UPDATE_IS_SCENARIO_FILES_LOADING,
  UPDATE_IS_SCENARIO_FILES_EDIT_MODE,
  UPDATE_SCENARIO_FILES_VALIDATION_ERRORS,
} from "../actions/scenarioFilesActions";
import { StoreType } from "../types/store.types";

export interface scenarioFilesStateType {
  data: ScenarioFile[];
  isLoading?: boolean;
  isEditMode?: boolean;
  validationErrors: ValidationError[];
}

export const scenarioFilesInitialState: scenarioFilesStateType = {
  data: [],
  validationErrors: [],
};

const scenarioFilesReducer = (state = scenarioFilesInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SCENARIO_FILES_DATA:
      return { ...state, data: action.payload };
    case UPDATE_SCENARIO_FILES_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];

      return { ...state, validationErrors };
    }
    case UPDATE_IS_SCENARIO_FILES_LOADING:
      return { ...state, isLoading: action.payload };
    case UPDATE_IS_SCENARIO_FILES_EDIT_MODE:
      return { ...state, isEditMode: action.payload };
    default:
      return { ...state };
  }
};

export const getCurrentScenarioFiles = (state: StoreType) => state.scenarioFiles.data;
export const getIsScenarioFilesLoading = (state: StoreType) => state.scenarioFiles.isLoading;
export const getIsScenarioFilesEditMode = (state: StoreType) => state.scenarioFiles.isEditMode;
export const getScenarioFilesValidationErrors = (state: StoreType) => state.scenarioFiles.validationErrors;

export default scenarioFilesReducer;
