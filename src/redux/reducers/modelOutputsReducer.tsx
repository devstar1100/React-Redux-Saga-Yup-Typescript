import { AlertData } from "../../types/alertData";
import { ModelOutputData } from "../../types/modelOutput";
import { ValidationError } from "../../types/validationError";

import {
  UPDATE_MODEL_OUTPUTS_LIST,
  UPDATE_MODEL_OUTPUTS_LOADING,
  UPDATE_MODEL_OUTPUT_ALERT_DATA,
  UPDATE_MODEL_OUTPUT_VALIDATION_ERRORS,
} from "../actions/modelOutputsActions";
import { StoreType } from "../types/store.types";

export interface modelOutputsStateType {
  data: ModelOutputData | null;
  validationErrors: ValidationError[];
  isLoading: boolean;
  alertData: AlertData;
}

export const modelOutputsInitialState: modelOutputsStateType = {
  data: null,
  validationErrors: [],
  isLoading: false,
  alertData: {
    isVisible: false,
    text: "",
  },
};

const modelOutputsReducer = (state = modelOutputsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_MODEL_OUTPUTS_LIST:
      return { ...state, data: action.payload };
    case UPDATE_MODEL_OUTPUTS_LOADING:
      return { ...state, isLoading: action.payload };
    case UPDATE_MODEL_OUTPUT_ALERT_DATA:
      return { ...state, alertData: action.payload };
    case UPDATE_MODEL_OUTPUT_VALIDATION_ERRORS:
      return { ...state, validationErrors: action.payload };
    default:
      return { ...state };
  }
};

export const getStoredModelOutputs = (state: StoreType) => state.modelOutputs.data;
export const getModelOutputsValidationErrors = (state: StoreType) => state.modelOutputs.validationErrors;
export const getModelOutputsLoading = (state: StoreType) => state.modelOutputs.isLoading;
export const getModelOutputsAlertData = (state: StoreType) => state.modelOutputs.alertData;

export default modelOutputsReducer;
