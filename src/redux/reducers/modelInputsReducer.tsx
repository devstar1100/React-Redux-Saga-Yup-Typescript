import { AlertData } from "../../types/alertData";
import { IModel, IModelInput } from "../../types/modelInput";
import { ValidationError } from "../../types/validationError";
import {
  SET_MODEL_INPUTS_LOADING,
  SET_MODEL_INPUTS_VALIDATION_ERRORS,
  SET_STORED_LIST_MODELS,
  SET_STORED_MODEL_INPUTS,
  UPDATE_MODEL_INPUT_ALERT_DATA,
} from "../actions/modelInputsActions";
import { StoreType } from "../types/store.types";

export interface modelInputsStateType {
  data: IModelInput[];
  models: IModel[];
  validationErrors: ValidationError[];
  isLoading: boolean;
  alertData: AlertData;
}

export const modelInputsInitialState: modelInputsStateType = {
  data: [],
  models: [],
  validationErrors: [],
  isLoading: false,
  alertData: {
    isVisible: false,
    text: "",
  },
};

const modelInputsReducer = (state = modelInputsInitialState, action: any) => {
  switch (action.type) {
    case SET_STORED_MODEL_INPUTS:
      return { ...state, data: action.payload };
    case SET_MODEL_INPUTS_VALIDATION_ERRORS: {
      const validationErrors = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, validationErrors };
    }
    case SET_MODEL_INPUTS_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_STORED_LIST_MODELS:
      return { ...state, models: action.payload };
    case UPDATE_MODEL_INPUT_ALERT_DATA:
      return { ...state, alertData: action.payload };
    default:
      return { ...state };
  }
};

export const getStoredModelInputs = (state: StoreType) => state.modelInputs.data;
export const getModelInputsValidationErrors = (state: StoreType) => state.modelInputs.validationErrors;
export const getModelInputsLoading = (state: StoreType) => state.modelInputs.isLoading;

export const getModels = (state: StoreType) => state.modelInputs.models;
export const getModelInputsAlertData = (state: StoreType) => state.modelInputs.alertData;

export default modelInputsReducer;
