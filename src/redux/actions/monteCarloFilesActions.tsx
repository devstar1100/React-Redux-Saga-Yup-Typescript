import { MonteCarloFile } from "../../types/monteCarloFile";
export const UPDATE_MONTECARLO_FILES_DATA = "UPDATE_MONTECARLO_FILES_DATA";
export const UPDATE_IS_MONTECARLO_FILES_LOADING = "UPDATE_IS_MONTECARLO_FILES_LOADING";
export const UPDATE_IS_MONTECARLO_FILES_EDIT_MODE = "UPDATE_IS_MONTECARLO_FILES_EDIT_MODE";
export const GET_MONTECARLO_FILES_SERVER = "GET_MONTECARLO_FILES_SERVER";
export const CLONE_MONTECARLO_FILE_SERVER = "CLONE_MONTECARLO_FILE_SERVER";
export const DELETE_MONTECARLO_FILE_SERVER = "DELETE_MONTECARLO_FILE_SERVER";
export const UPDATE_MONTECARLO_FILES_VALIDATION_ERRORS = "UPDATE_MONTECARLO_FILES_VALIDATION_ERRORS";

export interface ManageMonteCarloFilesProps {
  "simulation-id": number;
  "file-name": string;
  "action-type": string;
}

export const getMonteCarloFilesServer = () => ({
  type: GET_MONTECARLO_FILES_SERVER,
  payload: {
    request: {
      method: "GET",
      url: "/list-monte-carlo-inputs-outputs-files",
    },
  },
});

export const manageMonteCarloFileServer = (props: ManageMonteCarloFilesProps) => ({
  type: props["action-type"] === "clone" ? CLONE_MONTECARLO_FILE_SERVER : DELETE_MONTECARLO_FILE_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/manage-monte-carlo-inputs-outputs-file/${props["simulation-id"]}/${props["file-name"]}/${props["action-type"]}`,
    },
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
