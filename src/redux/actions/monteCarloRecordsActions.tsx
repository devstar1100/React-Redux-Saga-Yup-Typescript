import { MonteCarloRecord } from "../../types/monteCarloRecords";
import { ValidationError } from "../../types/validationError";
import { RedirectProps } from "./monteCarloBatchActions";
export const UPDATE_MONTECARLO_RECORDS_DATA = "UPDATE_MONTECARLO_RECORDS_DATA";
export const UPDATE_IS_MONTECARLO_RECORDS_LOADING = "UPDATE_IS_MONTECARLO_RECORDS_LOADING";
export const GET_MONTECARLO_RECORDS_SERVER = "GET_MONTECARLO_RECORDS_SERVER";
export const CLONE_MONTECARLO_RECORD_SERVER = "CLONE_MONTECARLO_RECORD_SERVER";
export const DELETE_MONTECARLO_RECORD_SERVER = "DELETE_MONTECARLO_RECORD_SERVER";
export const EDIT_MONTECARLO_RECORD_SERVER = "EDIT_MONTECARLO_RECORD_SERVER";
export const ADD_MONTECARLO_RECORD_SERVER = "ADD_MONTECARLO_RECORD_SERVER";
export const UPDATE_MONTECARLO_RECORD_VALIDATION_ERRORS = "UPDATE_MONTECARLO_RECORD_VALIDATION_ERRORS";

export interface ManageMonteCarloRecordsProps {
  "new-description"?: string;
  "record-type"?: string;
  "parameter-path"?: string;
  "parameter-value"?: string | number;
  "parameter-stddev"?: string | number;
  "simulation-id": string | number;
  filename?: string;
  description?: string;
  "action-type": string;
}

const actionTypeMap: Record<string, string> = {
  clone: CLONE_MONTECARLO_RECORD_SERVER,
  delete: DELETE_MONTECARLO_RECORD_SERVER,
  edit: EDIT_MONTECARLO_RECORD_SERVER,
  add: ADD_MONTECARLO_RECORD_SERVER,
};

export const getMonteCarloRecordsServer = (props: { simulationId: number; filename: string }) => ({
  type: GET_MONTECARLO_RECORDS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-monte-carlo-inputs-outputs-records/${props.simulationId}/${props.filename}`,
    },
  },
});

export const manageMonteCarloRecordServer = (props: ManageMonteCarloRecordsProps & RedirectProps) => ({
  type: actionTypeMap[props["action-type"]],
  payload: {
    request: {
      method: "POST",
      url: `/manage-monte-carlo-inputs-outputs-record/${props["simulation-id"]}/${props["filename"]}/${props.description}/${props["action-type"]}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const updateMonteCarloRecordsData = (data: MonteCarloRecord[]) => ({
  type: UPDATE_MONTECARLO_RECORDS_DATA,
  payload: data,
});

export const updateIsMonteCarloRecordsLoading = (isLoading: boolean) => ({
  type: UPDATE_IS_MONTECARLO_RECORDS_LOADING,
  payload: isLoading,
});

export const updateMonteCarloRecordValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_MONTECARLO_RECORD_VALIDATION_ERRORS,
  payload: errors,
});
