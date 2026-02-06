import { ListUnitAction } from "../../types/configurationFile";
import { MonteCarloBatch } from "../../types/monteCarloBatches";

export const DELETE_MONTECARLOBATCH_SERVER = "DELETE_MONTECARLOBATCH_SERVER";
export const CLONE_MONTECARLOBATCH_SERVER = "CLONE_MONTECARLOBATCH_SERVER";

type AddMonteCarloBatchServerProps = Pick<
  MonteCarloBatch,
  | "simulation-id"
  | "run-prefix"
  | "input-output-parameters-file-name"
  | "number-of-planned-runs"
  | "master-seed"
  | "max-execution-time-sec"
  | "sleep_seconds_between_runs"
  | "execution-speed"
>;

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
