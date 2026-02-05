import { put, takeEvery } from "redux-saga/effects";
import { failActionType } from "../../lib/failActionType";
import { successActionType } from "../../lib/successActionType";
import { Simulation, SimulationEnumType } from "../../types/simulations";
import {
  GET_ENUMERATORS_SERVER,
  GET_SIMULATIONS_EXTENDED_INFO_SERVER,
  GET_SIMULATIONS_SERVER,
  GET_SPECIFIC_ENUMERATOR_SERVER,
  MANAGE_SIMULATIONS_SERVER,
  updateAreSimulationsLoading,
  updateEnumerators,
  updateSimulations,
  updateSpecificEnumerator,
} from "../actions/simulationsActions";
import { toast } from "react-toastify";

const simulationsSaga = [
  takeEvery(GET_SIMULATIONS_SERVER, getSimulationsHandler),
  takeEvery(successActionType(GET_SIMULATIONS_SERVER), getSimulationsSuccessHandler),
  takeEvery(failActionType(GET_SIMULATIONS_SERVER), getSimulationsFailHandler),

  takeEvery(GET_SIMULATIONS_EXTENDED_INFO_SERVER, getSimulationsHandler),
  takeEvery(successActionType(GET_SIMULATIONS_EXTENDED_INFO_SERVER), getSimulationsSuccessHandler),
  takeEvery(failActionType(GET_SIMULATIONS_EXTENDED_INFO_SERVER), getSimulationsFailHandler),

  takeEvery(successActionType(GET_ENUMERATORS_SERVER), getEnumeratorsSuccessHandler),
  takeEvery(successActionType(GET_SPECIFIC_ENUMERATOR_SERVER), getSpecificEnumeratorSuccessHandler),

  takeEvery(successActionType(MANAGE_SIMULATIONS_SERVER), manageSimulationsSuccessHandler),
];

function* getSimulationsHandler() {
  yield put(updateAreSimulationsLoading(true));
}

function* getSimulationsSuccessHandler(action: any) {
  const response = action.payload.data as Simulation[];

  yield put(updateSimulations(response));
  yield put(updateAreSimulationsLoading(false));
}

function* getSimulationsFailHandler() {
  yield put(updateAreSimulationsLoading(false));
}

function* getEnumeratorsSuccessHandler(action: any) {
  const response = action.payload.data["enum-types"] as SimulationEnumType[];

  yield put(updateEnumerators(response));
}

function* getSpecificEnumeratorSuccessHandler(action: any) {
  const response = action.payload.data["enum-types"] as SimulationEnumType[];

  // Assuming the response contains a single enumerator
  if (response && response.length > 0) {
    yield put(updateSpecificEnumerator(response[0]));
  }
}

function* manageSimulationsSuccessHandler(action: any) {
  const simulationId = action.payload.data["simulation-id"];
  const requestUrl = action.meta?.previousAction?.payload?.request?.url;

  if (requestUrl && requestUrl.includes("build-executable")) {
    return;
  }

  yield toast.success(`Completed successfully for simulation ${simulationId}`);
}

export default simulationsSaga;
