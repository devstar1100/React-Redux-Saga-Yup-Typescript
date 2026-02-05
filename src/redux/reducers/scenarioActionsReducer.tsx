/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScenarioAction } from "../../types/scenarioAction";
import { ValidationError } from "../../types/validationError";
import {
  UPDATE_SCENARIO_LIST_ACTIONS_DATA,
  UPDATE_IS_SCENARIO_LIST_ACTIONS_LOADING,
  UPDATE_IS_SCENARIO_LIST_ACTIONS_EDIT_MODE,
  UPDATE_SCENARIO_ACTIONS_VALIDATION_ERRORS,
} from "../actions/scenarioListActions";
import { StoreType } from "../types/store.types";

export interface scenarioListActionsStateType {
  data: ScenarioAction[];
  isLoading?: boolean;
  isEditMode?: boolean;
  validationErrors: ValidationError[];
}

export const scenarioListActionsInitialState: scenarioListActionsStateType = {
  data: [],
  validationErrors: [],
};

const scenarioListActionsReducer = (state = scenarioListActionsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SCENARIO_LIST_ACTIONS_DATA:
      return { ...state, data: action.payload };
    case UPDATE_SCENARIO_ACTIONS_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];

      return { ...state, validationErrors };
    }
    case UPDATE_IS_SCENARIO_LIST_ACTIONS_LOADING:
      return { ...state, isLoading: action.payload };
    case UPDATE_IS_SCENARIO_LIST_ACTIONS_EDIT_MODE:
      return { ...state, isEditMode: action.payload };
    default:
      return { ...state };
  }
};

export const getCurrentScenarioListActions = (state: StoreType) => state.scenarioListActions.data;
export const getIsScenarioListActionsLoading = (state: StoreType) => state.scenarioListActions.isLoading;
export const getIsScenarioListActionsEditMode = (state: StoreType) => state.scenarioListActions.isEditMode;
export const getScenarioActionsValidationErrors = (state: StoreType) => state.scenarioListActions.validationErrors;

export default scenarioListActionsReducer;
