/* eslint-disable @typescript-eslint/no-explicit-any */
import { MonteCarloRecord } from "../../types/monteCarloRecords";
import { ValidationError } from "../../types/validationError";
import { StoreType } from "../types/store.types";
import {
  UPDATE_MONTECARLO_RECORDS_DATA,
  UPDATE_IS_MONTECARLO_RECORDS_LOADING,
  UPDATE_MONTECARLO_RECORD_VALIDATION_ERRORS,
} from "../actions/monteCarloRecordsActions";

export interface monteCarloRecordsStateType {
  data: MonteCarloRecord[];
  isLoading: boolean;
  validationErrors: ValidationError[];
}

export const MonteCarloRecordsInitialState: monteCarloRecordsStateType = {
  data: [],
  isLoading: false,
  validationErrors: [],
};

const monteCarloRecordsReducer = (state = MonteCarloRecordsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_MONTECARLO_RECORDS_DATA:
      return { ...state, data: action.payload };
    case UPDATE_IS_MONTECARLO_RECORDS_LOADING:
      return { ...state, isLoading: action.payload };
    case UPDATE_MONTECARLO_RECORD_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];
      return { ...state, validationErrors };
    }
    default:
      return { ...state };
  }
};

export const getCurrentMonteCarloRecords = (state: StoreType) => state.monteCarloRecords.data;
export const getIsMonteCarloRecordsLoading = (state: StoreType) => state.monteCarloRecords.isLoading;
export const getMonteCarloRecordValidationErrors = (state: StoreType) => state.monteCarloRecords.validationErrors;

export default monteCarloRecordsReducer;
