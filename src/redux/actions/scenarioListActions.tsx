import { ModelParameter } from "../../types/customViews";
import { ScenarioAction, ScenarioActionParameter } from "../../types/scenarioAction";
import { ValidationError } from "../../types/validationError";

export const UPDATE_SCENARIO_LIST_ACTIONS_DATA = "UPDATE_SCENARIO_LIST_ACTIONS_DATA";
export const UPDATE_IS_SCENARIO_LIST_ACTIONS_LOADING = "UPDATE_IS_SCENARIO_LIST_ACTIONS_LOADING";
export const UPDATE_IS_SCENARIO_LIST_ACTIONS_EDIT_MODE = "UPDATE_IS_SCENARIO_LIST_ACTIONS_EDIT_MODE";
export const GET_SCENARIO_LIST_ACTIONS_SERVER = "GET_SCENARIO_LIST_ACTIONS_SERVER";
export const MANAGE_SCENARIO_LIST_ACTIONS_SERVER = "MANAGE_SCENARIO_LIST_ACTIONS_SERVER";
export const ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER = "ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER";
export const UPDATE_SCENARIO_ACTIONS_VALIDATION_ERRORS = "UPDATE_SCENARIO_ACTIONS_VALIDATION_ERRORS";

export type ManageScenarioActionTypes = "delete" | "clone" | "add" | "edit";

interface ManageScenarioIntersection {
  scenarioFileId: number;
  actionType: ManageScenarioActionTypes;
}

interface ManageScenarioActionProps extends ManageScenarioIntersection {
  actionKey: string;
}

export interface ScenarioActionDto {
  "action-type-enum": number;
  "action-type": string;
  "action-enum": string;
  "time-representation-enum": number;
  "action-time": number;
  "console-message": string;
  "number-of-parameters": number;
  "parameters-list": ScenarioActionParameter[];
}

interface AddEditScenarioProps extends ManageScenarioIntersection {
  actionKey: string;
  scenarioFile: ScenarioActionDto;
  redirect: () => void;
}

export const getScenarioListActionsServer = (scenarioFileId: number) => ({
  type: GET_SCENARIO_LIST_ACTIONS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-scenario-actions/${scenarioFileId}`,
    },
  },
});

export const manageScenarioListActionsServer = (props: ManageScenarioActionProps) => ({
  type: MANAGE_SCENARIO_LIST_ACTIONS_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/manage-scenario-action/${props.scenarioFileId}/${props.actionKey}/${props.actionType}`,
    },
    scenarioFileId: props.scenarioFileId,
  },
});

export const addEditScenarioActionsServer = (props: AddEditScenarioProps) => ({
  type: ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/manage-scenario-action/${props.scenarioFileId}/${props.actionKey}/${props.actionType}`,
      data: props.scenarioFile,
    },
    redirect: props.redirect,
  },
});

export const updateScenarioListActionsData = (data: ScenarioAction[]) => ({
  type: UPDATE_SCENARIO_LIST_ACTIONS_DATA,
  payload: data,
});

export const updateIsScenarioListActionsLoading = (isLoading: boolean) => ({
  type: UPDATE_IS_SCENARIO_LIST_ACTIONS_LOADING,
  payload: isLoading,
});

export const updateIsScenarioListActionsEditMode = (isEditMode: boolean) => ({
  type: UPDATE_IS_SCENARIO_LIST_ACTIONS_EDIT_MODE,
  payload: isEditMode,
});

export const updateScenarioActionsValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_SCENARIO_ACTIONS_VALIDATION_ERRORS,
  payload: errors,
});
