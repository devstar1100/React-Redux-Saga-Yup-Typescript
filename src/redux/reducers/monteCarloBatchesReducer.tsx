/* eslint-disable @typescript-eslint/no-explicit-any */
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import {
  UPDATE_ARE_MONTECARLOBATCHESLIST_LOADING,
  UPDATE_MONTECARLOBATCHES,
} from "../actions/MonteCarloBatchesActions";

import { StoreType } from "../types/store.types";

export interface monteCarloBatchesStateType {
  monteCarloBatches: MonteCarloBatch[];
  areLoading: boolean;
}

export const monteCarloBatchesInitialState: monteCarloBatchesStateType = {
  monteCarloBatches: [],
  areLoading: false,
};

const monteCarloBatchesReducer = (state = monteCarloBatchesInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_MONTECARLOBATCHES:
      return { ...state, monteCarloBatches: action.payload };
    case UPDATE_ARE_MONTECARLOBATCHESLIST_LOADING:
      return { ...state, areLoading: action.payload };
    default:
      return { ...state };
  }
};

export const getMonteCarloBatches = (state: StoreType) => state.monteCarloBatches.monteCarloBatches;
export const getAreSimulationsLoading = (state: StoreType) => state.monteCarloBatches.areLoading;

export default monteCarloBatchesReducer;
