import { SimulatedModel } from "../../types/SimulatedModel";
import { AlertData } from "../../types/alertData";
import { ValidationError } from "../../types/validationError";

export const GET_SIMULATED_MODELS = "GET_SIMULATED_MODELS";
export const UPDATE_SIMULATED_MODELS = "UPDATE_SIMULATED_MODELS";
export const DUPLICATE_SIMULATED_MODEL = "DUPLICATE_SIMULATED_MODEL";
export const DELETE_SIMULATED_MODEL = "DELETE_SIMULATED_MODEL";
export const ADD_SIMULATED_MODEL = "ADD_SIMULATED_MODEL";
export const EDIT_SIMULATED_MODEL = "EDIT_SIMULATED_MODEL";
export const UPDATE_SIMULATED_MODELS_LOADING = "UPDATE_SIMULATED_MODELS_LOADING";
export const UPDATE_SIMULATED_MODEL_ERRORS = "UPDATE_SIMULATED_MODEL_ERRORS";
export const UPDATE_SIMULATED_MODEL_ALERT_DATA = "UPDATE_SIMULATED_MODEL_ALERT_DATA";

interface GetSimulatedModelsServerProps {
  simulationName: string;
}

export interface ManageSimulatedModelsServerProps {
  simulationName: string;
  modelId: number;
}

type Refetch = {
  refetch: () => void;
};

export interface SimulatedModelRequest {
  "simulation-name": string;
  "model-class-name": string;
  "model-alias": string;
  "system-or-model-type": 2 | 3;
  "parent-system-id": number;
  "high-level-model": number;
  "has-formal-interfaces": boolean;
  "hardware-model": number;
  "hardware-interface-type": number;
  "model-frequency": number;
  "number-of-steps-per-tick": number;
  plurality: number;
  "input-data-age": number;
  "execution-group-order": number;
}

interface AddSimulatedModelsServerProps extends ManageSimulatedModelsServerProps {
  simulatedModelData: SimulatedModelRequest;
  resetForm?: () => void;
  redirect?: () => void;
}

export interface InteractSimulatedModelServerProps extends ManageSimulatedModelsServerProps {
  refetch: () => void;
}

export const updateSimulatedModels = (simulatedModels: SimulatedModel[]) => ({
  type: UPDATE_SIMULATED_MODELS,
  payload: simulatedModels,
});

export const updateSimulatedModelErrors = (errors: ValidationError[]) => ({
  type: UPDATE_SIMULATED_MODEL_ERRORS,
  payload: errors,
});

export const updateSimulatedModelsLoading = (status: boolean) => ({
  type: UPDATE_SIMULATED_MODELS_LOADING,
  payload: {
    status,
  },
});

export const getSimulatedModelsServer = (props: GetSimulatedModelsServerProps) => ({
  type: GET_SIMULATED_MODELS,
  payload: {
    request: {
      method: "GET",
      url: `/list-systems-or-models/${props.simulationName}/model`,
    },
  },
});

export const duplicateSimulatedModelsServer = (props: InteractSimulatedModelServerProps) => ({
  type: DUPLICATE_SIMULATED_MODEL,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${props.simulationName}/${props.modelId}/clone`,
    },
    refetch: props.refetch,
  },
});

export const deleteSimulatedModelsServer = (props: InteractSimulatedModelServerProps) => ({
  type: DELETE_SIMULATED_MODEL,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${props.simulationName}/${props.modelId}/delete`,
    },
    refetch: props.refetch,
  },
});

export const addSimulatedModelsServer = (props: AddSimulatedModelsServerProps) => ({
  type: ADD_SIMULATED_MODEL,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${props.simulationName}/${props.modelId}/add`,
      params: props.simulatedModelData,
    },
    redirect: props.redirect,
    "class-name": props.simulatedModelData["model-class-name"],
  },
});

export const editSimulatedModelsServer = (props: AddSimulatedModelsServerProps) => ({
  type: EDIT_SIMULATED_MODEL,
  payload: {
    request: {
      method: "GET",
      url: `/manage-system-or-model/${props.simulationName}/${props.modelId}/edit`,
      params: props.simulatedModelData,
    },
    redirect: props.redirect,
    "class-name": props.simulatedModelData["model-class-name"],
  },
});

export const updateSimulatedModelAlertData = (alertData: AlertData) => ({
  type: UPDATE_SIMULATED_MODEL_ALERT_DATA,
  payload: alertData,
});
