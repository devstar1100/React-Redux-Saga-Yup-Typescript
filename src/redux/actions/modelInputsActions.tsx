import { AlertData } from "../../types/alertData";
import { ListUnitAction } from "../../types/configurationFile";
import { IModel, IModelInput } from "../../types/modelInput";
import { Simulation } from "../../types/simulations";
import { ValidationError } from "../../types/validationError";

export const SET_STORED_MODEL_INPUTS = "SET_STORED_MODEL_INPUTS";
export const SET_MODEL_INPUTS_VALIDATION_ERRORS = "SET_MODEL_INPUTS_VALIDATION_ERRORS";
export const SET_MODEL_INPUTS_LOADING = "SET_MODEL_INPUTS_LOADING";

export const FETCH_MODEL_INPUTS_SERVER = "FETCH_MODEL_INPUTS_SERVER";

// export const FETCH_MODEL_LIST_SIMULATIONS = "FETCH_MODEL_LIST_SIMULATIONS";

export const MANAGE_MODEL_INPUTS_ACTIONS_SERVER = "MANAGE_MODEL_INPUTS_ACTIONS_SERVER";
export const CLONE_MODEL_INPUTS_SERVER = "CLONE_MODEL_INPUTS_SERVER";
export const FETCH_LIST_MODELS_SERVER = "FETCH_LIST_MODELS_SERVER";
export const SET_STORED_LIST_MODELS = "SET_STORED_LIST_MODELS";
export const DELETE_MODEL_INPUTS_SERVER = "DELETE_MODEL_INPUTS_SERVER";
export const EDIT_MODEL_INPUT_SERVER = "EDIT_MODEL_INPUT_SERVER";
export const ADD_MODEL_INPUT_SERVER = "ADD_MODEL_INPUT_SERVER";
export const UPDATE_MODEL_INPUT_ALERT_DATA = "UPDATE_MODEL_INPUT_ALERT_DATA";

type IFetchModelInputsServerProps = Partial<{
  "simulation-name": string;
  "text-filter": string;
  "source-model-id": number;
  "target-model-id": number;
  "message-type": string;
  "formal-or-high-level": string;
}>;

export enum SystemsOrModelsListActionUnit {
  system = "system",
  model = "model",
}

type IFetchListSystemsOrModelsServerProps = Partial<{
  "simulation-name": string;
  "text-filter": string;
  "parent-system-id": number;
  "model-frequency": number;
  "model-type": string;
}>;

export type IManageModelInputsActionIntersection = Partial<{
  "simulation-name": string;
  "model-input-id": number;
}>;

export type AddModelInputsServerProps = Partial<{
  "source-model-id": number;
  "target-model-id": number;
  "model-output-id": number;
  "input-structure-name": string;
  "input-alias": string;
  "message-type": number;
  "is-a-formal-interface-message": boolean;
  "input-rule": number;
  "data-exchange-criteria": number;
  "specific-source-model-index": number;
  "specific-source-system-index": number;
  "specific-target-model-index": number;
  "specific-target-system-index": number;
}>;

export type AddModelOutput = Pick<Simulation, "simulation-name"> & {
  modelInputData: AddModelInputsServerProps;
};

export type EditModelOutput = Pick<IModelInput, "simulation-name" | "model-input-id"> & {
  modelInputData: AddModelInputsServerProps;
};

type Redirect = { redirect: () => void };

export const setStoredModelInputs = (data: IModelInput[]) => ({
  type: SET_STORED_MODEL_INPUTS,
  payload: data,
});

export const setModelInputsValidationErrors = (errors: ValidationError[]) => ({
  type: SET_MODEL_INPUTS_VALIDATION_ERRORS,
  payload: errors,
});

export const setModelInputsLoading = (value: boolean) => ({
  type: SET_MODEL_INPUTS_LOADING,
  payload: value,
});

export const updateModelInputAlertData = (alertData: AlertData) => ({
  type: UPDATE_MODEL_INPUT_ALERT_DATA,
  payload: alertData,
});

export const fetchModelInputsServer = (params: IFetchModelInputsServerProps) => ({
  type: FETCH_MODEL_INPUTS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-model-inputs/${params["simulation-name"] || ""}`,
      params: { ...params },
    },
  },
});

export const fetchListModelsServer = (params: IFetchListSystemsOrModelsServerProps) => ({
  type: FETCH_LIST_MODELS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-systems-or-models/${params["simulation-name"]}/${SystemsOrModelsListActionUnit.model}`,
      params: { ...params },
    },
  },
});

export const setStoredListModels = (data: IModel[]) => ({
  type: SET_STORED_LIST_MODELS,
  payload: data,
});

export const cloneModelInputsServer = (props: IManageModelInputsActionIntersection & AddModelInputsServerProps) => ({
  type: CLONE_MODEL_INPUTS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-input/${props["simulation-name"]}/${props["model-input-id"]}/${ListUnitAction.clone}`,
      params: { ...props },
    },
  },
});

export const deleteModelInputsServer = (props: IManageModelInputsActionIntersection) => ({
  type: DELETE_MODEL_INPUTS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-input/${props["simulation-name"]}/${props["model-input-id"]}/${ListUnitAction.delete}`,
    },
    simulationName: props["simulation-name"],
  },
});

export const editModelInputServer = (props: EditModelOutput & Redirect) => ({
  type: EDIT_MODEL_INPUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-input/${props["simulation-name"]}/${props["model-input-id"]}/${ListUnitAction.edit}`,
      params: props.modelInputData,
    },
    redirect: props.redirect,
    simulationName: props["simulation-name"],
    structureName: props.modelInputData["input-structure-name"],
  },
});

export const addModelInputServer = (props: AddModelOutput & Redirect) => ({
  type: ADD_MODEL_INPUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-model-input/${props["simulation-name"]}/0/${ListUnitAction.add}`,
      params: props.modelInputData,
    },
    redirect: props.redirect,
    simulationName: props["simulation-name"],
    structureName: props.modelInputData["input-structure-name"],
  },
});
