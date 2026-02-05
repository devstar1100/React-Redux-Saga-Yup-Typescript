/* eslint-disable @typescript-eslint/no-explicit-any */
import { Simulation, SimulationEnumType } from "../../types/simulations";
import {
  UPDATE_ARE_SIMULATIONS_LOADING,
  UPDATE_ENUMERATORS,
  UPDATE_SIMULATIONS,
  UPDATE_SPECIFIC_ENUMERATOR,
} from "../actions/simulationsActions";
import { StoreType } from "../types/store.types";

export interface simulationsStateType {
  simulations: Simulation[];
  enumerators: SimulationEnumType[];
  areLoading: boolean;
}

export const simulationsInitialState: simulationsStateType = {
  simulations: [],
  enumerators: [],
  areLoading: false,
};

const simulationsReducer = (state = simulationsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SIMULATIONS:
      return { ...state, simulations: action.payload };
    case UPDATE_ENUMERATORS:
      return { ...state, enumerators: action.payload };
    case UPDATE_SPECIFIC_ENUMERATOR: {
      const existingIndex = state.enumerators.findIndex(
        (enumerator) => enumerator["enum-type"] === action.payload["enum-type"],
      );
      if (existingIndex >= 0) {
        // Replace existing enumerator
        const newEnumerators = [...state.enumerators];
        newEnumerators[existingIndex] = action.payload;
        return { ...state, enumerators: newEnumerators };
      } else {
        // Add new enumerator
        return { ...state, enumerators: [...state.enumerators, action.payload] };
      }
    }
    case UPDATE_ARE_SIMULATIONS_LOADING:
      return { ...state, areLoading: action.payload };
    default:
      return { ...state };
  }
};

export const getSimulations = (state: StoreType) => state.simulations.simulations;
export const getEnumerators = (state: StoreType) => state.simulations.enumerators;
export const getAreSimulationsLoading = (state: StoreType) => state.simulations.areLoading;

export default simulationsReducer;
