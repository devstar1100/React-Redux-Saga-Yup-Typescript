/* eslint-disable @typescript-eslint/no-explicit-any */
import { SimulatedModel } from "../../types/SimulatedModel";
import { AlertData } from "../../types/alertData";
import { LogRecordsData } from "../../types/simulations";
import { ValidationError } from "../../types/validationError";
import {
  UPDATE_SIMULATED_MODELS,
  UPDATE_SIMULATED_MODELS_LOADING,
  UPDATE_SIMULATED_MODEL_ALERT_DATA,
  UPDATE_SIMULATED_MODEL_ERRORS,
} from "../actions/simulatedModelsActions";
import { StoreType } from "../types/store.types";

export interface SimulatedModelsLoaders {
  isSimulationDataLoading?: boolean;
  isSessionActionLoading?: boolean;
  isSimulationHyrarchyLoading?: boolean;
}

export interface simulatedModelsStateType {
  data?: SimulatedModel[];
  loaders?: Required<SimulatedModelsLoaders>;
  validationErrors: ValidationError[];
  alertData: AlertData;
}

export const simulationInitialState: simulatedModelsStateType = {
  validationErrors: [],
  alertData: {
    isVisible: false,
    text: "",
  },
};

export const logRecordsClearState: LogRecordsData = {
  "total-number-of-log-records": 0,
  "total-number-of-warnings": 0,
  "total-number-of-errors": 0,
  "total-number-of-fatals": 0,
  "log-records": [],
};

const simulatedModelsReducer = (state = simulationInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SIMULATED_MODELS:
      return { ...state, data: action.payload };
    case UPDATE_SIMULATED_MODELS_LOADING:
      return { ...state, loaders: { ...state.loaders, isSimulationDataLoading: action.payload.status } };
    case UPDATE_SIMULATED_MODEL_ERRORS: {
      const validationErrors = Array.isArray(action.payload) ? action.payload : [];

      return { ...state, validationErrors };
    }
    case UPDATE_SIMULATED_MODEL_ALERT_DATA: {
      return { ...state, alertData: action.payload };
    }
    default:
      return { ...state };
  }
};

export const getSimulatedModels = (state: StoreType) => state.simulatedModels.data;
export const getIsSimulatedModelsLoading = (state: StoreType) => state.simulatedModels.loaders?.isSimulationDataLoading;
export const getSimulatedModelsValidationErrors = (state: StoreType) => state.simulatedModels.validationErrors;
export const getSimulatedModelAlertData = (state: StoreType) => state.simulatedModels.alertData;

export default simulatedModelsReducer;
