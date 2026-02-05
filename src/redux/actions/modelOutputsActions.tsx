import { AlertData } from "../../types/alertData";
import { ListUnitAction } from "../../types/configurationFile";
import { IModelOutput } from "../../types/modelOutput";
import { Simulation } from "../../types/simulations";
import { ValidationError } from "../../types/validationError";

export const FETCH_MODEL_OUTPUTS_LIST_SERVER = "FETCH_MODEL_OUTPUTS_LIST_SERVER";
export const UPDATE_MODEL_OUTPUTS_LIST = "UPDATE_MODEL_OUTPUTS_LIST";
export const UPDATE_MODEL_OUTPUTS_LOADING = "UPDATE_MODEL_OUTPUTS_LOADING";

export const CLONE_MODEL_OUTPUT_SERVER = "CLONE_MODEL_OUTPUT_SERVER";
export const DELETE_MODEL_OUTPUT_SERVER = "DELETE_MODEL_OUTPUT_SERVER";

export const ADD_MODEL_OUTPUT_SERVER = "ADD_MODEL_OUTPUT_SERVER";
export const EDIT_MODEL_OUTPUT_SERVER = "EDIT_MODEL_OUTPUT_SERVER";
export const UPDATE_MODEL_OUTPUT_VALIDATION_ERRORS = "UPDATE_MODEL_OUTPUT_VALIDATION_ERRORS";

export const UPDATE_MODEL_OUTPUT_ALERT_DATA = "UPDATE_MODEL_OUTPUT_ALERT_DATA";

export enum SystemsOrModelsListActionUnit {
  system = "system",
  model = "model",
}

type IFetchModelOutputsListServerProps = Pick<Simulation, "simulation-name">;

export type IManageModelInputsActionIntersection = Partial<{
  "simulation-name": string;
  "model-input-id": number;
}>;

export type ManageModelOutputServerProps = Pick<Simulation, "simulation-name"> & Pick<IModelOutput, "model-output-id">;

export interface ModelOutputRequest {
  "model-full-path": string;
  "message-type": number;
  "output-suffix": string;
  "output-structure-name": string;
  "output-alias": string;
  "model-id"?: number;
}

type Redirect = { redirect: () => void };

export type AddModelOutput = Pick<Simulation, "simulation-name"> & {
  modelOutputData: ModelOutputRequest;
};

export type EditModelOutput = Pick<IModelOutput, "simulation-name" | "model-output-id"> & {
  modelOutputData: ModelOutputRequest;
};

export const updateStoredModelOutputsList = (data: IModelOutput[]) => ({
  type: UPDATE_MODEL_OUTPUTS_LIST,
  payload: data,
});

export const updateModelOutputsValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_MODEL_OUTPUT_VALIDATION_ERRORS,
  payload: errors,
});

export const updateModelOutputAlertData = (alertData: AlertData) => ({
  type: UPDATE_MODEL_OUTPUT_ALERT_DATA,
  payload: alertData,
});

export const fetchModelOutputsListServer = (params: IFetchModelOutputsListServerProps) => ({
  type: FETCH_MODEL_OUTPUTS_LIST_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-model-outputs/${params["simulation-name"]}`,
    },
  },
});

export const cloneModelOutputServer = (props: ManageModelOutputServerProps) => ({
  type: CLONE_MODEL_OUTPUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-output/${props["simulation-name"]}/${props["model-output-id"]}/${ListUnitAction.clone}`,
    },
  },
});

export const deleteModelOutputServer = (props: ManageModelOutputServerProps) => ({
  type: DELETE_MODEL_OUTPUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-output/${props["simulation-name"]}/${props["model-output-id"]}/${ListUnitAction.delete}`,
    },
    simulationName: props["simulation-name"],
  },
});

export const editModelOutputServer = (props: EditModelOutput & Redirect) => ({
  type: EDIT_MODEL_OUTPUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-output/${props["simulation-name"]}/${props["model-output-id"]}/${ListUnitAction.edit}`,
      params: props.modelOutputData,
    },
    redirect: props.redirect,
    simulationName: props["simulation-name"],
    structureName: props.modelOutputData["output-structure-name"],
  },
});

export const addModelOutputServer = (props: AddModelOutput & Redirect) => ({
  type: ADD_MODEL_OUTPUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-output/${props["simulation-name"]}/0/${ListUnitAction.add}`,
      params: props.modelOutputData,
    },
    redirect: props.redirect,
    simulationName: props["simulation-name"],
    structureName: props.modelOutputData["output-structure-name"],
  },
});

export const updateModelOutputsLoading = (value: boolean) => ({
  type: UPDATE_MODEL_OUTPUTS_LOADING,
  payload: value,
});
