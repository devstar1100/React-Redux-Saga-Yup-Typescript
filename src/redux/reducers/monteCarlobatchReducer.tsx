/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationError } from "../../types/validationError";
import { UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS } from "../actions/MonteCarloBatchActions";
import { StoreType } from "../types/store.types";

export interface monteCarloBatchStateType {
  validationErrors: ValidationError[];
}

export const monteCarloBatchInitialState: monteCarloBatchStateType = {
  validationErrors: [],
};

const monteCarloBatchReducer = (state = monteCarloBatchInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];
      return { ...state, validationErrors };
    }
    default:
      return { ...state };
  }
};

export const getMonteCarloBatchValidationErrors = (state: StoreType) => state.monteCarloBatch.validationErrors;
export default monteCarloBatchReducer;
