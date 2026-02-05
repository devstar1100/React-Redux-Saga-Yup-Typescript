import { ListUnitAction } from "../../types/configurationFile";
import { SimulationUser } from "../../types/simulationUser";
import { ValidationError } from "../../types/validationError";

export const GET_SIMULATION_USERS_SERVER = "GET_SIMULATION_USERS_SERVER";
export const ADD_SIMULATION_USER_SERVER = "ADD_SIMULATION_USER_SERVER";
export const EDIT_SIMULATION_USER_SERVER = "EDIT_SIMULATION_USER_SERVER";
export const DELETE_SIMULATION_USER_SERVER = "DELETE_SIMULATION_USER_SERVER";

export const UPDATE_SIMULATION_USERS = "UPDATE_SIMULATION_USERS";
export const UPDATE_SIMULATION_USER_VALIDATION_ERRORS = "UPDATE_SIMULATION_USER_VALIDATION_ERRORS";
export const UPDATE_ARE_SIMULATION_USERS_LOADING = "UPDATE_ARE_SIMULATION_USERS_LOADING";

export interface RedirectProps {
  redirect?: (subroute?: string) => void;
}

export interface GetSimulationUsersServerProps {
  "user-id"?: number;
}

interface PasswordType {
  password: string;
  "repeat-password": string;
}

type AddSimulationUserServerProps = Pick<
  SimulationUser,
  "user-name" | "first-name" | "last-name" | "user-role" | "user-status" | "email"
> &
  PasswordType &
  Partial<Pick<SimulationUser, "associated-projects" | "max-number-of-sessions" | "max-number-of-processes">>;

type EditSimulationUserServerProps = AddSimulationUserServerProps &
  Pick<SimulationUser, "user-id"> &
  Partial<PasswordType>;

export const updateSimulationUsers = (simulationUsers: SimulationUser[]) => ({
  type: UPDATE_SIMULATION_USERS,
  payload: simulationUsers,
});

export const updateSimulationUserValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_SIMULATION_USER_VALIDATION_ERRORS,
  payload: errors,
});

export const updateAreSimulationUsersLoading = (areLoading: boolean) => ({
  type: UPDATE_ARE_SIMULATION_USERS_LOADING,
  payload: areLoading,
});

export const getSimulationUsersServer = (props: GetSimulationUsersServerProps) => ({
  type: GET_SIMULATION_USERS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-simulation-users`,
      params: { ...props },
    },
  },
});

export const addSimulationUserServer = (props: AddSimulationUserServerProps & RedirectProps) => ({
  type: ADD_SIMULATION_USER_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-user/${0}/${ListUnitAction.add}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const editSimulationUserServer = (props: EditSimulationUserServerProps & RedirectProps) => ({
  type: EDIT_SIMULATION_USER_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-user/${props["user-id"]}/${ListUnitAction.edit}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const deleteSimulationUserServer = (props: Required<GetSimulationUsersServerProps>) => ({
  type: DELETE_SIMULATION_USER_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-user/${props["user-id"]}/${ListUnitAction.delete}`,
    },
  },
});
