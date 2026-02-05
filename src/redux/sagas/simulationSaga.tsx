import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { CustomViewType } from "../../types/customViews";
import {
  LogRecordsData,
  RefreshSimulationDataServerResponse,
  Session,
  Simulation,
  SimulationActionType,
  SimulationDataHyrarchy,
  TimeInformation,
} from "../../types/simulations";
import {
  fetchLogRecordsServer,
  FetchLogRecordsServerProps,
  FETCH_LOG_RECORDS_SERVER,
  FETCH_SIMULATION_HYRARCHY_SERVER,
  GET_SIMULATION_DATA_SERVER,
  LAUNCH_SIMULATION_SESSION_SERVER,
  queryTimeInformationServer,
  QUERY_TIME_INFORMATION_SERVER,
  REFRESH_SIMULATION_DATA_SERVER,
  RUN_SIMULATION_ACTION_SERVER,
  RUN_SIMULATION_SESSION_ACTION_SERVER,
  updateLogRecords,
  updateSimulationData,
  updateSimulationHyrarchy,
  updateSimulationLoaders,
  updateSimulationSessionInfo,
  updateSimulationTimeInfo,
  getSimulationDataServer,
  ADD_SIMULATION_SERVER,
  EDIT_SIMULATION_SERVER,
  DELETE_SIMULATION_SERVER,
  updateSimulationValidationErrors,
  updateSimulationDataBrowserFilters,
  SET_SCENARIO_PARAMETER_SERVER,
  CLONE_SIMULATION_SERVER,
} from "../actions/simulationActions";
import {
  getCurrentSimulation,
  getLogRecords,
  getSessionInformation,
  getSimulationHyrarchy,
  getTimeInformation,
} from "../reducers/simulationReducer";
import { failActionType } from "../../lib/failActionType";
import { toast } from "react-toastify";
import { getSimulationCustomViewsServer } from "../actions/customViewsActions";
import { getSimulations } from "../reducers/simulationsReducer";
import { updateSimulations } from "../actions/simulationsActions";
import { ValidationError } from "../../types/validationError";

const simulationSaga = [
  takeEvery(GET_SIMULATION_DATA_SERVER, getSimulationDataHandler),
  takeEvery(successActionType(GET_SIMULATION_DATA_SERVER), getSimulationDataSuccessHandler),
  takeEvery(failActionType(GET_SIMULATION_DATA_SERVER), getSimulationDataFailHandler),

  takeEvery(successActionType(RUN_SIMULATION_ACTION_SERVER), runSimulationActionSuccessHandler),

  takeEvery(RUN_SIMULATION_SESSION_ACTION_SERVER, runSimulationSessionActionHandler),
  takeEvery(successActionType(RUN_SIMULATION_SESSION_ACTION_SERVER), runSimulationSessionActionSuccessHandler),
  takeEvery(failActionType(RUN_SIMULATION_SESSION_ACTION_SERVER), runSimulationSessionActionFailHandler),

  takeEvery(LAUNCH_SIMULATION_SESSION_SERVER, runSimulationSessionActionHandler),
  takeEvery(successActionType(LAUNCH_SIMULATION_SESSION_SERVER), launchSimulationSessionSuccessHandler),
  takeEvery(failActionType(LAUNCH_SIMULATION_SESSION_SERVER), runSimulationSessionActionFailHandler),

  takeEvery(successActionType(QUERY_TIME_INFORMATION_SERVER), queryTimeInformationSuccessHandler),

  takeEvery(successActionType(FETCH_LOG_RECORDS_SERVER), fetchLogRecordsSuccessHandler),

  takeEvery(FETCH_SIMULATION_HYRARCHY_SERVER, fetchSimulationHyrarchyHandler),
  takeEvery(successActionType(FETCH_SIMULATION_HYRARCHY_SERVER), fetchSimulationHyrarchySuccessHandler),
  takeEvery(failActionType(FETCH_SIMULATION_HYRARCHY_SERVER), fetchSimulationHyrarchyFailHandler),

  takeEvery(successActionType(REFRESH_SIMULATION_DATA_SERVER), refreshSimulationDataSuccessHandler),

  takeEvery(successActionType(ADD_SIMULATION_SERVER), addSimulationSuccessHandler),
  takeEvery(failActionType(ADD_SIMULATION_SERVER), addEditSimulationFailHandler),

  takeEvery(successActionType(EDIT_SIMULATION_SERVER), editSimulationSuccessHandler),
  takeEvery(failActionType(EDIT_SIMULATION_SERVER), addEditSimulationFailHandler),

  takeEvery(successActionType(DELETE_SIMULATION_SERVER), deleteSimulationSuccessHandler),
  takeEvery(failActionType(DELETE_SIMULATION_SERVER), deleteSimulationFailHandler),

  takeEvery(successActionType(CLONE_SIMULATION_SERVER), cloneSimulationSuccessHandler),
  takeEvery(failActionType(CLONE_SIMULATION_SERVER), cloneSimulationFailHandler),

  takeEvery(successActionType(SET_SCENARIO_PARAMETER_SERVER), setScenarioParameterSuccessHandler),
  takeEvery(failActionType(SET_SCENARIO_PARAMETER_SERVER), setScenarioParameterFailHandler),
];

function* getSimulationDataHandler(action: any) {
  if (!action.payload.disableLoaders) yield put(updateSimulationLoaders({ isSimulationDataLoading: true }));
}

function* getSimulationDataSuccessHandler(action: any) {
  const response = action.payload.data[0] as Simulation;

  yield put(updateSimulationData(response));
  yield put(updateSimulationLoaders({ isSimulationDataLoading: false }));
}

function* getSimulationDataFailHandler() {
  yield put(updateSimulationLoaders({ isSimulationDataLoading: false }));
}

function* runSimulationActionSuccessHandler(action: any) {
  const response = action.payload.data as Simulation;
  const prevData = getCurrentSimulation(yield select());
  const redirect = action.meta.previousAction.payload.redirect;

  const actionType = action.meta.previousAction.payload.request.url
    ?.split("/")
    ?.slice(-1)
    ?.pop() as SimulationActionType;

  const simulationId = action.meta.previousAction.payload.request.url?.split("/")?.[2];

  if (actionType === SimulationActionType.select) {
    toast.success("Simulation was selected!");
    yield put(getSimulationDataServer({ simulationId: +simulationId, disableLoaders: true }));
    yield put(getSimulationCustomViewsServer(+simulationId));
  }

  if (prevData && prevData["simulation-id"] === response["simulation-id"]) {
    const nextData: Simulation = {
      ...prevData,
      ...response,
    };

    yield put(updateSimulationData(nextData));
  }

  if (redirect) redirect();
}

function* runSimulationSessionActionHandler(action: any) {
  if (!action.payload.disableLoaders) yield put(updateSimulationLoaders({ isSessionActionLoading: true }));
}

function* runSimulationSessionActionSuccessHandler(action: any) {
  const response = action.payload.data as Session;
  const prevData = getSessionInformation(yield select());
  const redirect = action.meta.previousAction.payload.redirect;

  yield put(
    updateSimulationSessionInfo({
      ...prevData,
      ...response,
    }),
  );
  yield put(queryTimeInformationServer(response["simulation-session-id"]));

  yield put(updateSimulationLoaders({ isSessionActionLoading: false }));
  if (redirect) redirect();
}

function* runSimulationSessionActionFailHandler() {
  yield put(updateSimulationLoaders({ isSessionActionLoading: false }));
}

function* launchSimulationSessionSuccessHandler(action: any) {
  const response = action.payload.data as Session;
  const prevData = getSessionInformation(yield select());
  const redirect = action.meta.previousAction.payload.redirect;
  const sessionId = response["simulation-session-id"];

  yield put(updateSimulationSessionInfo({ ...prevData, ...response }));
  if (redirect) redirect(`/${sessionId}`);

  yield put(updateSimulationLoaders({ isSessionActionLoading: false }));

  yield put(queryTimeInformationServer(sessionId));
  yield put(fetchLogRecordsServer({ "simulation-session-id": sessionId, "start-index": 0 }));
  yield put(updateSimulationDataBrowserFilters({ search: "", systemType: [], modelType: [], instanceNumber: "0" }));
}

function* queryTimeInformationSuccessHandler(action: any) {
  const response = action.payload.data as TimeInformation;
  const prevData = getTimeInformation(yield select());

  yield put(updateSimulationTimeInfo({ ...prevData, ...response }));
}

function* fetchLogRecordsHandler(action: any) {
  const props = action.payload as Omit<FetchLogRecordsServerProps, "start-index">;
  const prevData = getLogRecords(yield select());

  const startIndex = !prevData?.["log-records"]?.length
    ? 0
    : (prevData["log-records"].slice(-1).pop()?.["log-record-index"] || -1) + 1;

  yield put(fetchLogRecordsServer({ ...props, "start-index": startIndex }));
}

function* fetchLogRecordsSuccessHandler(action: any) {
  const response = action.payload.data as LogRecordsData;
  const prevData = getLogRecords(yield select());

  const nextData: LogRecordsData = {
    ...prevData,
    ...response,
    "log-records": prevData ? [...prevData["log-records"], ...response["log-records"]] : response["log-records"],
  };

  yield put(updateLogRecords(nextData));
}

function* fetchSimulationHyrarchyHandler() {
  yield put(updateSimulationLoaders({ isSimulationHyrarchyLoading: true }));
}

function* fetchSimulationHyrarchySuccessHandler(action: any) {
  const response = action.payload.data as SimulationDataHyrarchy;
  const prevData = getSimulationHyrarchy(yield select());

  const prevActionParams = action.meta.previousAction.payload.request.params;
  const substitudeData = action.meta.previousAction.payload.request.substitudeData;

  if (prevActionParams["max-number-of-systems-to-fetch"] === 1 && prevActionParams["expand-model-data-items"]) {
    const updatedSystem = response["simulation-systems"][0];
    const nextSystems = !substitudeData
      ? (prevData?.["simulation-systems"] || []).map((system) =>
          system["system-instance-unique-id"] === updatedSystem["system-instance-unique-id"]
            ? { ...system, ...updatedSystem }
            : system,
        )
      : [updatedSystem];

    const nextData: SimulationDataHyrarchy = {
      ...prevData,
      "simulation-systems": nextSystems,
    } as SimulationDataHyrarchy;
    yield put(updateSimulationHyrarchy(nextData));
  } else if (prevActionParams["max-number-of-systems-to-fetch"] > 1 && prevActionParams["start-system-index"] > 0) {
    const nextSystems = [...(prevData?.["simulation-systems"] || []), ...response["simulation-systems"]];

    const nextData: SimulationDataHyrarchy = {
      ...prevData,
      "simulation-systems": nextSystems,
    } as SimulationDataHyrarchy;
    yield put(updateSimulationHyrarchy(nextData));
  } else {
    const nextData: SimulationDataHyrarchy = { ...prevData, ...response };
    yield put(updateSimulationHyrarchy(nextData));
  }

  yield put(updateSimulationLoaders({ isSimulationHyrarchyLoading: false }));
}

function* fetchSimulationHyrarchyFailHandler() {
  yield put(updateSimulationLoaders({ isSimulationHyrarchyLoading: false }));
}

function* refreshSimulationDataSuccessHandler(action: any) {
  const response = action.payload.data as RefreshSimulationDataServerResponse;
  const prevData = getSimulationHyrarchy(yield select()) as SimulationDataHyrarchy;

  if (prevData) {
    const updatedSystems = (prevData["simulation-systems"] || []).map((system) => ({
      ...system,
      "system-models": (system["system-models"] || []).map((model) => ({
        ...model,
        "model-data-items": (model["model-data-items"] || []).map((item) => ({
          ...item,
          ...(response["models-data"]?.find?.((el) => el["param-path"] === item["param-path"]) || {}),
        })),
      })),
    }));

    const updatedCustomData = (prevData["custom-simulation-data"] || []).map((item) => ({
      ...item,
      ...(response["custom-simulation-data"].find((el) => el["param-path"] === item["param-path"]) || {}),
    }));

    const nextDataDraft = {
      ...prevData,
      "refresh-interval-seconds": response["refresh-interval-seconds"],
      "simulation-session-data": response["simulation-session-data"],
      "simulation-time-data": response["simulation-time-data"],
      "custom-simulation-data": updatedCustomData,
      "simulation-systems": updatedSystems,
    } as SimulationDataHyrarchy;

    yield put(updateSimulationHyrarchy(nextDataDraft));
  }
}

function* addSimulationSuccessHandler(action: any) {
  const response = action.payload.data as Simulation;
  const simulationsList = getSimulations(yield select());

  const nextSimulationsList = [...simulationsList, response];

  yield put(updateSimulations(nextSimulationsList));
  toast.success(`Simulation ${response["simulation-name"]} was successfully added`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addEditSimulationFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];
  yield put(updateSimulationValidationErrors(response));
}

function* editSimulationSuccessHandler(action: any) {
  const response = action.payload.data as Simulation;
  const simulationsList = getSimulations(yield select());

  const nextSimulationsList = simulationsList.map((item) =>
    item["simulation-id"] === response["simulation-id"] ? { ...item, ...response } : item,
  );

  yield put(updateSimulations(nextSimulationsList));
  toast.success(`Simulation ${response["simulation-name"]} was successfully updated`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* deleteSimulationSuccessHandler(action: any) {
  const response = action.payload.data as Simulation;
  const simulationsList = getSimulations(yield select());

  const nextSimulationsList = simulationsList.filter(
    (item) => item["simulation-id"].toString() !== response["simulation-id"].toString(),
  );

  yield put(updateSimulations(nextSimulationsList));
  toast.success(`Simulation was successfully deleted`);
}

function* deleteSimulationFailHandler() {
  // whatever;
}

function* cloneSimulationSuccessHandler(action: any) {
  const response = action.payload.data as Simulation;
  const simulationsList = getSimulations(yield select());

  const nextSimulationsList = [...simulationsList, response];

  yield put(updateSimulations(nextSimulationsList));
  toast.success(`Simulation ${response["simulation-name"]} was successfully duplicated`);
}

function* cloneSimulationFailHandler() {
  // whatever;
}

function* setScenarioParameterSuccessHandler() {
  yield toast.success("Parameter value has been updated successfully!");
}

function* setScenarioParameterFailHandler() {
  // whatever
}

export default simulationSaga;
