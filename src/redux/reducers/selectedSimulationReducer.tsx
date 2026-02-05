import { UPDATE_SELECTED_SIMULATION_NAME } from "../actions/selectedSimulationActions";
import { StoreType } from "../types/store.types";

export interface selectedSimulationStateType {
  simulationName: string;
}

export const selectedSimulationInitialState: selectedSimulationStateType = {
  simulationName: "",
};

const selectedSimulationReducer = (state = selectedSimulationInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SELECTED_SIMULATION_NAME:
      return {
        ...state,
        simulationName: action.payload,
      };
    default:
      return { ...state };
  }
};

export const getSelectedSimulationName = (state: StoreType) => state.selectedSimulation.simulationName;

export default selectedSimulationReducer;
