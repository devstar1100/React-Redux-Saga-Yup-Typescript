import { ListUnitAction } from "../../types/configurationFile";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import { ValidationError } from "../../types/validationError";

export const ADD_MONTECARLOBATCH_SERVER = "ADD_MONTECARLOBATCH_SERVER";
export const EDIT_SIMULATION_SERVER = "EDIT_SIMULATION_SERVER";
export const EDIT_MONTECARLOBATCH_SERVER = "EDIT_MONTECARLOBATCH_SERVER";
export const UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS = "UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS";
export const DELETE_MONTECARLOBATCH_SERVER = "DELETE_MONTECARLOBATCH_SERVER";
export const CLONE_MONTECARLOBATCH_SERVER = "CLONE_MONTECARLOBATCH_SERVER";

export interface RedirectProps {
  redirect?: (subroute?: string) => void;
}

export interface ActionType {
  actionType: string;
}

type AddMonteCarloBatchServerProps = Pick<
  MonteCarloBatch,
  | "user-id"
  | "batch-id"
  | "simulation-id"
  | "run-prefix"
  | "input-output-parameters-file-name"
  | "number-of-planned-runs"
  | "master-seed"
  | "max-execution-time-sec"
  | "sleep-seconds-between-runs"
  | "execution-speed"
>;

export const updateMonteCarloBatchValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_MONTECARLOBATCH_VALIDATION_ERRORS,
  payload: errors,
});

export const deleteMonteCarloBatchServer = (props: Pick<MonteCarloBatch, "batch-id">) => ({
  type: DELETE_MONTECARLOBATCH_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/monte-carlo-batch-manage/${ListUnitAction.delete}/${props["batch-id"]}`,
    },
  },
});

export const cloneMonteCarloBatchServer = (
  props: Pick<MonteCarloBatch, "batch-id"> & AddMonteCarloBatchServerProps,
) => ({
  type: CLONE_MONTECARLOBATCH_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/monte-carlo-batch-manage/${ListUnitAction.clone}/${props["batch-id"]}`,
      params: { ...props },
    },
  },
});

export const addEditMonteCarloBatchServer = (props: AddMonteCarloBatchServerProps & RedirectProps & ActionType) => ({
  type: props.actionType === "edit" ? EDIT_MONTECARLOBATCH_SERVER : ADD_MONTECARLOBATCH_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/monte-carlo-batch-manage/${props.actionType}/${props["batch-id"]}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});
