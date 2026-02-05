import { SimulationUser } from "../../types/simulationUser";
import { ValidationError } from "../../types/validationError";
import {
  UPDATE_ARE_SIMULATION_USERS_LOADING,
  UPDATE_SIMULATION_USERS,
  UPDATE_SIMULATION_USER_VALIDATION_ERRORS,
} from "../actions/simulationUsersActions";
import { StoreType } from "../types/store.types";

export interface simulationUsersStateType {
  simulationUsers: SimulationUser[];
  validationErrors: ValidationError[];
  areLoading: boolean;
}

export const simulationUsersInitialState: simulationUsersStateType = {
  simulationUsers: [],
  validationErrors: [],
  areLoading: false,
};

const simulationUsersReducer = (state = simulationUsersInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SIMULATION_USERS:
      return { ...state, simulationUsers: action.payload };
    case UPDATE_SIMULATION_USER_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];
      return { ...state, validationErrors };
    }
    case UPDATE_ARE_SIMULATION_USERS_LOADING:
      return { ...state, areLoading: action.payload };
    default:
      return { ...state };
  }
};

export const getSimulationUsers = (state: StoreType) => state.simulationUsers.simulationUsers;
export const getSimulationUserValidationErrors = (state: StoreType) => state.simulationUsers.validationErrors;
export const getAreSimulationUsersLoading = (state: StoreType) => state.simulationUsers.areLoading;

export default simulationUsersReducer;
