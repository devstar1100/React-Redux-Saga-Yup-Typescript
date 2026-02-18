import { MonteCarloFile } from "../../types/monteCarloFile";
import { ValidationError } from "../../types/validationError";
import { RedirectProps } from "./monteCarloBatchActions";
export const UPDATE_MONTECARLO_FILES_DATA = "UPDATE_MONTECARLO_FILES_DATA";
export const UPDATE_IS_MONTECARLO_FILES_LOADING = "UPDATE_IS_MONTECARLO_FILES_LOADING";
export const GET_MONTECARLO_FILES_SERVER = "GET_MONTECARLO_FILES_SERVER";
export const CLONE_MONTECARLO_FILE_SERVER = "CLONE_MONTECARLO_FILE_SERVER";
export const DELETE_MONTECARLO_FILE_SERVER = "DELETE_MONTECARLO_FILE_SERVER";
export const EDIT_MONTECARLO_FILE_SERVER = "EDIT_MONTECARLO_FILE_SERVER";
export const ADD_MONTECARLO_FILE_SERVER = "ADD_MONTECARLO_FILE_SERVER";
export const UPDATE_MONTECARLO_FILE_VALIDATION_ERRORS = "UPDATE_MONTECARLO_FILE_VALIDATION_ERRORS";

export interface ManageMonteCarloFilesProps {
  "simulation-id": number;
  "file-name": string;
  "action-type": string;
  "new-simulation-id"?: number;
  "new-filename"?: string;
}

const actionTypeMap: Record<string, string> = {
  clone: CLONE_MONTECARLO_FILE_SERVER,
  delete: DELETE_MONTECARLO_FILE_SERVER,
  edit: EDIT_MONTECARLO_FILE_SERVER,
  add: ADD_MONTECARLO_FILE_SERVER,
};

export const getMonteCarloFilesServer = () => ({
  type: GET_MONTECARLO_FILES_SERVER,
  payload: {
    request: {
      method: "GET",
      url: "/list-monte-carlo-inputs-outputs-files",
    },
  },
});

export const manageMonteCarloFileServer = (props: ManageMonteCarloFilesProps & RedirectProps) => ({
  type: actionTypeMap[props["action-type"]],
  payload: {
    request: {
      method: "POST",
      url: `/manage-monte-carlo-inputs-outputs-file/${props["simulation-id"]}/${props["file-name"]}/${props["action-type"]}`,
      params: { "new-simulation-id": props["new-simulation-id"], "new-filename": props["new-filename"] },
    },
    redirect: props.redirect,
  },
});

export const updateMonteCarloFilesData = (data: MonteCarloFile[]) => ({
  type: UPDATE_MONTECARLO_FILES_DATA,
  payload: data,
});

export const updateIsMonteCarloFilesLoading = (isLoading: boolean) => ({
  type: UPDATE_IS_MONTECARLO_FILES_LOADING,
  payload: isLoading,
});

export const updateMonteCarloFileValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_MONTECARLO_FILE_VALIDATION_ERRORS,
  payload: errors,
});
