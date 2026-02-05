import { AlertData } from "../../types/alertData";
import { ISimulatedSystem } from "../../types/simulatedSystems";
import { ValidationError } from "../../types/validationError";

export const SET_STORED_SIMULATED_SYSTEMS = "SET_STORED_SIMULATED_SYSTEMS";
export const SET_SIMULATED_SYSTEMS_VALIDATION_ERRORS = "SET_SIMULATED_SYSTEMS_VALIDATION_ERRORS";
export const SET_SIMULATED_SYSTEMS_LOADING = "SET_SIMULATED_SYSTEMS_LOADING";
export const ADD_SIMULATED_SYSTEM_SERVER = "ADD_SIMULATED_SYSTEM_SERVER";
export const EDIT_SIMULATED_SYSTEM_SERVER = "EDIT_SIMULATED_SYSTEM_SERVER";
export const DELETE_SIMULATED_SYSTEM_SERVER = "DELETE_SIMULATED_SYSTEM_SERVER";
export const CLONE_SIMULATED_SYSTEM_SERVER = "CLONE_SIMULATED_SYSTEM_SERVER";
export const FETCH_SIMULATED_SYSTEMS_SERVER = "FETCH_SIMULATED_SYSTEMS_SERVER";
export const SET_SIMULATED_SYSTEMS_ALERT_DATA = "SET_SIMULATED_SYSTEMS_ALERT_DATA";

type IManageSimulatedSystemServerProps = Partial<{
  "simulation-name": string;
  "model-id": number;
}>;

export interface SimulatedSystemRequest {
  "model-class-name": string;
  "model-alias": string;
  plurality: number;
  "model-frequency": number;
  "number-of-steps-per-tick": number;
  "has-formal-interfaces": boolean;
  "system-or-model-type": 2 | 1;
  "input-data-age": string;
  "execution-group-order": string;
  "high-level-model"?: string;
}

export type AddSimulatedSystemProps = { data: SimulatedSystemRequest } & Pick<
  IManageSimulatedSystemServerProps,
  "simulation-name"
>;

export type EditSimulatedSystem = { data: SimulatedSystemRequest } & IManageSimulatedSystemServerProps;

export interface RedirectProps {
  redirect?: (subroute?: string) => void;
}

export const setStoredSimulatedSystems = (data: ISimulatedSystem[]) => ({
  type: SET_STORED_SIMULATED_SYSTEMS,
  payload: data,
});

export const setSimulatedSystemsValidationErrors = (errors: ValidationError[]) => ({
  type: SET_SIMULATED_SYSTEMS_VALIDATION_ERRORS,
  payload: errors,
});

export const setSimulatedSystemsLoading = (value: boolean) => ({
  type: SET_SIMULATED_SYSTEMS_LOADING,
  payload: value,
});

export const setSimulatedSystemsAlertData = (alertData: AlertData) => ({
  type: SET_SIMULATED_SYSTEMS_ALERT_DATA,
  payload: alertData,
});

export const fetchSimulatedSystemsServer = (params: IManageSimulatedSystemServerProps) => ({
  type: FETCH_SIMULATED_SYSTEMS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-systems-or-models/${params["simulation-name"]}/system`,
    },
  },
});

export const addSimulatedSystemServer = (params: AddSimulatedSystemProps & RedirectProps) => ({
  type: ADD_SIMULATED_SYSTEM_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${params["simulation-name"]}/0/add`,
      params: params.data,
    },
    "simulation-name": params["simulation-name"],
    "class-name": params.data["model-class-name"],
    redirect: params.redirect,
  },
});

export const deleteSimulatedSystemServer = (params: IManageSimulatedSystemServerProps) => ({
  type: DELETE_SIMULATED_SYSTEM_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${params["simulation-name"]}/${params["model-id"]}/delete`,
    },
    "simulation-name": params["simulation-name"],
  },
});

export const cloneSimulatedSystemServer = (params: IManageSimulatedSystemServerProps) => ({
  type: CLONE_SIMULATED_SYSTEM_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${params["simulation-name"]}/${params["model-id"]}/clone`,
    },
    "simulation-name": params["simulation-name"],
  },
});

export const editSimulatedSystemServer = (params: EditSimulatedSystem & RedirectProps) => ({
  type: EDIT_SIMULATED_SYSTEM_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${params["simulation-name"]}/${params["model-id"]}/edit`,
      params: params.data,
    },
    "simulation-name": params["simulation-name"],
    "class-name": params.data["model-class-name"],
    redirect: params.redirect,
  },
});
