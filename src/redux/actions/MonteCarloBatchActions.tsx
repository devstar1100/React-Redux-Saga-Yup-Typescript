import { ListUnitAction } from "../../types/configurationFile";
import { DataBrowserFilters } from "../../types/dataBrowserFilters";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import {
  LogRecordsData,
  Session,
  Simulation,
  SimulationActionType,
  SimulationDataHyrarchy,
  SimulationSessionActionType,
  SimulationStatus,
  TimeInformation,
} from "../../types/simulations";
import { ValidationError } from "../../types/validationError";
import { SimulationLoaders } from "../reducers/simulationReducer";

export const GET_SIMULATION_DATA_SERVER = "GET_SIMULATION_DATA_SERVER";
export const RUN_SIMULATION_ACTION_SERVER = "RUN_SIMULATION_ACTION_SERVER";
export const RUN_SIMULATION_SESSION_ACTION_SERVER = "RUN_SIMULATION_SESSION_ACTION_SERVER";
export const LAUNCH_SIMULATION_SESSION_SERVER = "LAUNCH_SIMULATION_SESSION_SERVER";
export const QUERY_TIME_INFORMATION_SERVER = "QUERY_TIME_INFORMATION_SERVER";
export const FETCH_LOG_RECORDS_SERVER = "FETCH_LOG_RECORDS_SERVER";
export const FETCH_SIMULATION_HYRARCHY_SERVER = "FETCH_SIMULATION_HYRARCHY_SERVER";
export const REFRESH_SIMULATION_DATA_SERVER = "REFRESH_SIMULATION_DATA_SERVER";
export const ADD_SIMULATION_SERVER = "ADD_SIMULATION_SERVER";
export const EDIT_SIMULATION_SERVER = "EDIT_SIMULATION_SERVER";
export const DELETE_MONTECARLOBATCH_SERVER = "DELETE_MONTECARLOBATCH_SERVER";
export const CLONE_MONTECARLOBATCH_SERVER = "CLONE_MONTECARLOBATCH_SERVER";
export const SET_SCENARIO_PARAMETER_SERVER = "SET_SCENARIO_PARAMETER_SERVER";

export const UPDATE_SIMULATION_DATA = "UPDATE_SIMULATION_DATA";
export const UPDATE_LOG_RECORDS = "UPDATE_LOG_RECORDS";
export const UPDATE_SIMULATION_HYRARCHY = "UPDATE_SIMULATION_HYRARCHY";
export const UPDATE_SIMULATION_TIME_INFO = "UPDATE_SIMULATION_TIME_INFO";
export const UPDATE_SIMULATION_SESSION_INFO = "UPDATE_SIMULATION_SESSION_INFO";
export const CLEAR_SIMULATION_SESSION = "CLEAR_SIMULATION_SESSION";
export const UPDATE_SIMULATION_LOADERS = "UPDATE_SIMULATION_LOADERS";
export const UPDATE_SIMULATION_VALIDATION_ERRORS = "UPDATE_SIMULATION_VALIDATION_ERRORS";
export const UPDATE_SIMULATION_DATA_BROWSER_FILTERS = "UPDATE_SIMULATION_DATA_BROWSER_FILTERS";

export interface RedirectProps {
  redirect?: (subroute?: string) => void;
}

export interface RunSimulationActionServerProps {
  "simulation-id": number;
  "action-type": SimulationActionType;
  "simulation-status"?: SimulationStatus;
}

interface RunSimulationSessionActionServerProps {
  "simulation-session-id": number;
  "action-type": SimulationSessionActionType;
  "required-speed"?: number;
}

export interface FetchLogRecordsServerProps {
  "simulation-session-id": number;
  "start-index": number;
}

interface FetchSimulationHyrarchyServerProps {
  "simulation-session-id": number;
  "max-number-of-systems-to-fetch": number;
  "start-system-index": number;
  "expand-model-data-items": boolean;
  "search-term"?: string;
  "selected-system-type-ids"?: string;
  "selected-model-type-ids"?: string;
  "system-instance-number"?: string;
  substitudeData?: boolean;
}

interface LaunchSimulationSessionServerProps {
  "simulation-id": number;
  "initial-conditions-name"?: string;
  "scenario-name"?: string;
}

interface GetSimulationDataServerProps {
  simulationId: number;
}

interface DisableLoadersProps {
  disableLoaders?: boolean;
}

interface RefreshSimulationDataServerProps {
  "simulation-session-id": number;
  "requested-models": string[];
  "requested-systems": string[];
  "system-instance-number": string;
  "search-term"?: string;
}

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

type EditSimulationServerProps = AddMonteCarloBatchServerProps & Pick<Simulation, "simulation-id">;

interface SetScenarioParameterServerProps {
  "simulation-session-id": number;
  "parameter-path": string;
  "parameter-value": string;
  "scheduled-tick-number"?: number;
}

export const getSimulationDataServer = ({
  simulationId,
  disableLoaders,
}: GetSimulationDataServerProps & DisableLoadersProps) => ({
  type: GET_SIMULATION_DATA_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/simulations`,
      params: { "simulation-id": simulationId },
    },
    disableLoaders,
  },
});

export const runSimulationActionServer = (props: RunSimulationActionServerProps & RedirectProps) => ({
  type: RUN_SIMULATION_ACTION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/simulation/${props["simulation-id"]}/${props["action-type"]}`,
      params: { "simulation-status": props["simulation-status"] },
    },
    redirect: props.redirect,
  },
});

export const runSimulationSessionActionServer = (
  props: RunSimulationSessionActionServerProps & RedirectProps & DisableLoadersProps,
) => ({
  type: RUN_SIMULATION_SESSION_ACTION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/simulation-session/${props["simulation-session-id"]}/${props["action-type"]}`,
      params: { "required-speed": props["required-speed"] },
    },
    redirect: props.redirect,
    disableLoaders: props.disableLoaders,
  },
});

export const launchSimulationSessionServer = (props: LaunchSimulationSessionServerProps & RedirectProps) => ({
  type: LAUNCH_SIMULATION_SESSION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/launch-simulation-session/${props["simulation-id"]}`,
      params: { "initial-conditions-name": props["initial-conditions-name"], "scenario-name": props["scenario-name"] },
    },
    redirect: props.redirect,
  },
});

export const queryTimeInformationServer = (simulationSessionId: number) => ({
  type: QUERY_TIME_INFORMATION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/query-time-information/${simulationSessionId}`,
    },
  },
});

export const fetchLogRecordsServer = (props: FetchLogRecordsServerProps) => ({
  type: FETCH_LOG_RECORDS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/fetch-log-records/${props["simulation-session-id"]}/${props["start-index"]}`,
    },
  },
});

export const fetchSimulationHyrarchyServer = (props: FetchSimulationHyrarchyServerProps) => ({
  type: FETCH_SIMULATION_HYRARCHY_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/fetch-simulation-hyrarchy/${props["simulation-session-id"]}`,
      params: {
        "max-number-of-systems-to-fetch": props["max-number-of-systems-to-fetch"],
        "start-system-index": props["start-system-index"],
        "expand-model-data-items": props["expand-model-data-items"],
        "search-term": props["search-term"],
        "selected-system-type-ids": props["selected-system-type-ids"],
        "selected-model-type-ids": props["selected-model-type-ids"],
        "system-instance-number": props["system-instance-number"],
      },
      substitudeData: props.substitudeData,
    },
  },
});

export const refreshSimulationDataServer = (props: RefreshSimulationDataServerProps) => ({
  type: REFRESH_SIMULATION_DATA_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/fetch-simulation-data/${props["simulation-session-id"]}?search-term=${props["search-term"] || ""}`,
      data: {
        "requested-models": props["requested-models"],
        "system-instance-number": props["system-instance-number"],
        "requested-systems": props["requested-systems"],
      },
    },
  },
});

export const addSimulationServer = (props: AddMonteCarloBatchServerProps & RedirectProps) => ({
  type: ADD_SIMULATION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation/${0}/${ListUnitAction.add}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const editSimulationServer = (props: EditSimulationServerProps & RedirectProps) => ({
  type: EDIT_SIMULATION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation/${props["simulation-id"]}/${ListUnitAction.edit}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
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

export const setScenarioParameterServer = (props: SetScenarioParameterServerProps) => ({
  type: SET_SCENARIO_PARAMETER_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/set-scenario-parameter/${props["simulation-session-id"]}`,
      params: { ...props },
    },
  },
});

export const updateSimulationData = (data: Simulation) => ({
  type: UPDATE_SIMULATION_DATA,
  payload: data,
});

export const updateLogRecords = (logRecords: LogRecordsData) => ({
  type: UPDATE_LOG_RECORDS,
  payload: logRecords,
});

export const updateSimulationHyrarchy = (hyrarchy: SimulationDataHyrarchy) => ({
  type: UPDATE_SIMULATION_HYRARCHY,
  payload: hyrarchy,
});

export const updateSimulationTimeInfo = (timeInfo: TimeInformation) => ({
  type: UPDATE_SIMULATION_TIME_INFO,
  payload: timeInfo,
});

export const updateSimulationSessionInfo = (sessionInfo: Session) => ({
  type: UPDATE_SIMULATION_SESSION_INFO,
  payload: sessionInfo,
});

export const clearSimulationSession = () => ({
  type: CLEAR_SIMULATION_SESSION,
});

export const updateSimulationLoaders = (loaders: SimulationLoaders) => ({
  type: UPDATE_SIMULATION_LOADERS,
  payload: loaders,
});

export const updateSimulationValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_SIMULATION_VALIDATION_ERRORS,
  payload: errors,
});

export const updateSimulationDataBrowserFilters = (filters: DataBrowserFilters) => ({
  type: UPDATE_SIMULATION_DATA_BROWSER_FILTERS,
  payload: filters,
});
