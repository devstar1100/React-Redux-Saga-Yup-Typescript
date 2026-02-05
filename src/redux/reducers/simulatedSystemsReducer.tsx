import { AlertData } from "../../types/alertData";
import { ServerNode } from "../../types/serverNode";
import { ISimulatedSystem } from "../../types/simulatedSystems";
import { ValidationError } from "../../types/validationError";
import {
  SET_SIMULATED_SYSTEMS_ALERT_DATA,
  SET_SIMULATED_SYSTEMS_LOADING,
  SET_SIMULATED_SYSTEMS_VALIDATION_ERRORS,
  SET_STORED_SIMULATED_SYSTEMS,
} from "../actions/simulatedSystemsActions";
import { StoreType } from "../types/store.types";

export interface simulatedSystemsStateType {
  data: ISimulatedSystem[];
  validationErrors: ValidationError[];
  isLoading: boolean;
  alertData: AlertData;
}

export const simulatedSystemsInitialState: simulatedSystemsStateType = {
  data: [],
  validationErrors: [],
  isLoading: false,
  alertData: {
    isVisible: false,
    text: "",
  },
};

const simulatedSystemsReducer = (state = simulatedSystemsInitialState, action: any) => {
  switch (action.type) {
    case SET_STORED_SIMULATED_SYSTEMS:
      return { ...state, data: action.payload };
    case SET_SIMULATED_SYSTEMS_VALIDATION_ERRORS: {
      const validationErrors = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, validationErrors };
    }
    case SET_SIMULATED_SYSTEMS_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_SIMULATED_SYSTEMS_ALERT_DATA:
      return { ...state, alertData: action.payload };
    default:
      return { ...state };
  }
};

export const getStoredSimulatedSystems = (state: StoreType) => state.simulatedSystems.data;
export const getSimulatedSystemsValidationErrors = (state: StoreType) => state.simulatedSystems.validationErrors;
export const getSimulatedSystemsLoading = (state: StoreType) => state.simulatedSystems.isLoading;
export const getSimulatedSystemsAlertData = (state: StoreType) => state.simulatedSystems.alertData;

export default simulatedSystemsReducer;
