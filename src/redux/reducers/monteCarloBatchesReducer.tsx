/* eslint-disable @typescript-eslint/no-explicit-any */
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import { ValidationError } from "../../types/validationError";
import { UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS } from "../actions/MonteCarloBatchActions";
import {
  UPDATE_ARE_MONTECARLOBATCHESLIST_LOADING,
  UPDATE_MONTECARLOBATCHES,
} from "../actions/MonteCarloBatchesActions";

import { StoreType } from "../types/store.types";

export interface monteCarloBatchesStateType {
  monteCarloBatches: MonteCarloBatch[];
  areLoading: boolean;
  validationErrors: ValidationError[];
}

export const monteCarloBatchesInitialState: monteCarloBatchesStateType = {
  monteCarloBatches: [],
  areLoading: false,
  validationErrors: [],
};

const monteCarloBatchesReducer = (state = monteCarloBatchesInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_MONTECARLOBATCHES:
      return { ...state, monteCarloBatches: action.payload };
    case UPDATE_ARE_MONTECARLOBATCHESLIST_LOADING:
      return { ...state, areLoading: action.payload };
    case UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];
      return { ...state, validationErrors };
    }
    default:
      return { ...state };
  }
};

export const getMonteCarloBatches = (state: StoreType) => state.monteCarloBatches.monteCarloBatches;
export const getAreMonteCarloBatchesLoading = (state: StoreType) => state.monteCarloBatches.areLoading;
export const getMonteCarloBatchValidationErrors = (state: StoreType) => state.monteCarloBatches.validationErrors;

export default monteCarloBatchesReducer;
