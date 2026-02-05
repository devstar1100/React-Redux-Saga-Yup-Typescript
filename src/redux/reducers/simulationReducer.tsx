/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataBrowserFilters } from "../../types/dataBrowserFilters";
import { LogRecordsData, Session, Simulation, SimulationDataHyrarchy, TimeInformation } from "../../types/simulations";
import { ValidationError } from "../../types/validationError";
import {
  CLEAR_SIMULATION_SESSION,
  UPDATE_LOG_RECORDS,
  UPDATE_SIMULATION_DATA,
  UPDATE_SIMULATION_DATA_BROWSER_FILTERS,
  UPDATE_SIMULATION_HYRARCHY,
  UPDATE_SIMULATION_LOADERS,
  UPDATE_SIMULATION_SESSION_INFO,
  UPDATE_SIMULATION_TIME_INFO,
  UPDATE_SIMULATION_VALIDATION_ERRORS,
} from "../actions/simulationActions";
import { StoreType } from "../types/store.types";

export interface SimulationLoaders {
  isSimulationDataLoading?: boolean;
  isSessionActionLoading?: boolean;
  isSimulationHyrarchyLoading?: boolean;
}

export interface simulationStateType {
  data?: Simulation;
  currentSessionId?: number;
  hyrarchy?: SimulationDataHyrarchy;
  logRecords?: LogRecordsData;
  timeInformation?: TimeInformation;
  sessionInformation?: Session;
  loaders?: Required<SimulationLoaders>;
  validationErrors: ValidationError[];
  dataBrowserFilters: DataBrowserFilters;
}

export const simulationInitialState: simulationStateType = {
  validationErrors: [],
  dataBrowserFilters: {
    search: "",
    systemType: [],
    modelType: [],
    instanceNumber: "0",
  },
};

export const logRecordsClearState: LogRecordsData = {
  "total-number-of-log-records": 0,
  "total-number-of-warnings": 0,
  "total-number-of-errors": 0,
  "total-number-of-fatals": 0,
  "log-records": [],
};

const simulationReducer = (state = simulationInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SIMULATION_DATA:
      return { ...state, data: action.payload };
    case UPDATE_SIMULATION_HYRARCHY:
      return { ...state, hyrarchy: action.payload };
    case UPDATE_LOG_RECORDS:
      return { ...state, logRecords: action.payload };
    case UPDATE_SIMULATION_TIME_INFO:
      return { ...state, timeInformation: action.payload };
    case UPDATE_SIMULATION_SESSION_INFO:
      return { ...state, sessionInformation: action.payload };
    case CLEAR_SIMULATION_SESSION:
      return {
        ...state,
        currentSessionId: undefined,
        hyrarchy: undefined,
        logRecords: undefined,
        timeInformation: undefined,
        sessionInformation: undefined,
      };
    case UPDATE_SIMULATION_LOADERS:
      return { ...state, loaders: { ...state.loaders, ...action.payload } };
    case UPDATE_SIMULATION_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];

      return { ...state, validationErrors };
    }
    case UPDATE_SIMULATION_DATA_BROWSER_FILTERS:
      return { ...state, dataBrowserFilters: action.payload };
    default:
      return { ...state };
  }
};

export const getCurrentSimulation = (state: StoreType) => state.simulation.data;
export const getCurrentSessionId = (state: StoreType) => state.simulation.currentSessionId;
export const getSimulationHyrarchy = (state: StoreType) => state.simulation.hyrarchy;
export const getLogRecords = (state: StoreType) => state.simulation.logRecords;
export const getTimeInformation = (state: StoreType) => state.simulation.timeInformation;
export const getSessionInformation = (state: StoreType) => state.simulation.sessionInformation;
export const getSimulationLoadingStates = (state: StoreType) => state.simulation.loaders;
export const getSimulationValidationErrors = (state: StoreType) => state.simulation.validationErrors;
export const getSimulationDataBrowserFilters = (state: StoreType) => state.simulation.dataBrowserFilters;

export default simulationReducer;
