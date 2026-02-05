import { ScenarioFile } from "../../types/scenarioFile";
import { ValidationError } from "../../types/validationError";

export const UPDATE_SCENARIO_FILES_DATA = "UPDATE_SCENARIO_FILES_DATA";
export const UPDATE_IS_SCENARIO_FILES_LOADING = "UPDATE_IS_SCENARIO_FILES_LOADING";
export const UPDATE_IS_SCENARIO_FILES_EDIT_MODE = "UPDATE_IS_SCENARIO_FILES_EDIT_MODE";
export const GET_SCENARIO_FILES_SERVER = "GET_SCENARIO_FILES_SERVER";
export const MANAGE_SCENARIO_FILE_SERVER = "MANAGE_SCENARIO_FILE_SERVER";
export const ADD_EDIT_SCENARIO_FILE_SERVER = "ADD_EDIT_SCENARIO_FILE_SERVER";
export const UPDATE_SCENARIO_FILES_VALIDATION_ERRORS = "UPDATE_SCENARIO_FILES_VALIDATION_ERRORS";

export type ManageScenarioActionTypes = "delete" | "clone" | "add" | "edit";

interface ManageScenarioProps {
  scenarioFileId: number;
  actionType: ManageScenarioActionTypes;
}

export interface ScenarioFileDto {
  "simulation-id": number;
  "scenario-file-id": number;
  "scenario-file-name": string;
  "time-representation": number;
}

interface AddEditScenarioProps extends ManageScenarioProps {
  scenarioFile: ScenarioFileDto;
  redirect: () => void;
  successMessage: string;
}

export const getScenarioFilesServer = (simulationId?: number) => ({
  type: GET_SCENARIO_FILES_SERVER,
  payload: {
    request: {
      method: "GET",
      url: "/list-scenario-files",
      params: { "simulation-id": simulationId },
    },
  },
});

export const manageScenarioFileServer = (props: ManageScenarioProps) => ({
  type: MANAGE_SCENARIO_FILE_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/manage-scenario-file/${props.scenarioFileId}/${props.actionType}`,
    },
  },
});

export const addEditScenarioFileServer = (props: AddEditScenarioProps) => ({
  type: ADD_EDIT_SCENARIO_FILE_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/manage-scenario-file/${props.scenarioFileId}/${props.actionType}`,
      params: props.scenarioFile,
    },
    redirect: props.redirect,
    successMessage: props.successMessage,
  },
});

export const updateScenarioFilesData = (data: ScenarioFile[]) => ({
  type: UPDATE_SCENARIO_FILES_DATA,
  payload: data,
});

export const updateIsScenarioFilesLoading = (isLoading: boolean) => ({
  type: UPDATE_IS_SCENARIO_FILES_LOADING,
  payload: isLoading,
});

export const updateIsScenarioFilesEditMode = (isEditMode: boolean) => ({
  type: UPDATE_IS_SCENARIO_FILES_EDIT_MODE,
  payload: isEditMode,
});

export const updateScenarioFilesValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_SCENARIO_FILES_VALIDATION_ERRORS,
  payload: errors,
});
