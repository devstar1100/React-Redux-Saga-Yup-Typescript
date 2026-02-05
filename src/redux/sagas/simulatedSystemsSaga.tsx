import { put, select, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";

import { failActionType } from "../../lib/failActionType";
import { successActionType } from "../../lib/successActionType";
import {
  ADD_SIMULATED_SYSTEM_SERVER,
  CLONE_SIMULATED_SYSTEM_SERVER,
  DELETE_SIMULATED_SYSTEM_SERVER,
  EDIT_SIMULATED_SYSTEM_SERVER,
  FETCH_SIMULATED_SYSTEMS_SERVER,
  fetchSimulatedSystemsServer,
  setSimulatedSystemsAlertData,
  setSimulatedSystemsLoading,
  setSimulatedSystemsValidationErrors,
  setStoredSimulatedSystems,
} from "../actions/simulatedSystemsActions";
import { ISimulatedSystem } from "../../types/simulatedSystems";
import { ValidationError } from "../../types/validationError";

const simulatedSystemsSaga = [
  takeEvery(FETCH_SIMULATED_SYSTEMS_SERVER, fetchSimulatedSystemsServerHandler),
  takeEvery(successActionType(FETCH_SIMULATED_SYSTEMS_SERVER), fetchSimulatedSystemsServerSuccess),
  takeEvery(failActionType(FETCH_SIMULATED_SYSTEMS_SERVER), fetchSimulatedSystemsServerFail),

  takeEvery(successActionType(ADD_SIMULATED_SYSTEM_SERVER), addSimulatedSystemServerSuccess),
  takeEvery(failActionType(ADD_SIMULATED_SYSTEM_SERVER), addSimulatedSystemServerFail),

  takeEvery(successActionType(DELETE_SIMULATED_SYSTEM_SERVER), deleteSimulatedSystemServerSuccess),

  takeEvery(successActionType(CLONE_SIMULATED_SYSTEM_SERVER), cloneSimulatedSystemServerSuccess),

  takeEvery(successActionType(EDIT_SIMULATED_SYSTEM_SERVER), editSimulatedSystemServerSuccess),
  takeEvery(failActionType(EDIT_SIMULATED_SYSTEM_SERVER), editSimulatedSystemServerFail),
];

function* fetchSimulatedSystemsServerHandler() {
  yield put(setSimulatedSystemsLoading(true));
}

function* fetchSimulatedSystemsServerSuccess(action: any) {
  const response = action.payload.data as ISimulatedSystem[];
  yield put(setStoredSimulatedSystems(response));
  yield put(setSimulatedSystemsLoading(false));
}

function* fetchSimulatedSystemsServerFail(action: any) {
  yield put(setSimulatedSystemsLoading(false));
}

function* addSimulatedSystemServerSuccess(action: any) {
  const simulationName = action.meta.previousAction.payload["simulation-name"];
  const className = action.meta.previousAction.payload["class-name"];
  const redirect = action.meta.previousAction.payload.redirect;

  yield put(fetchSimulatedSystemsServer({ "simulation-name": simulationName }));
  yield put(
    setSimulatedSystemsAlertData({
      isVisible: true,
      text: `Simulated system ${className} was successfully added`,
    }),
  );

  if (redirect) redirect();
}

function* addSimulatedSystemServerFail(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield put(setSimulatedSystemsValidationErrors(response));
}

function* deleteSimulatedSystemServerSuccess(action: any) {
  const simulationName = action.meta.previousAction.payload["simulation-name"];
  yield put(fetchSimulatedSystemsServer({ "simulation-name": simulationName }));
  toast.success("Simulated system was successfully deleted");
}

function* cloneSimulatedSystemServerSuccess(action: any) {
  const simulationName = action.meta.previousAction.payload["simulation-name"];
  yield put(fetchSimulatedSystemsServer({ "simulation-name": simulationName }));
}

function* editSimulatedSystemServerSuccess(action: any) {
  const simulationName = action.meta.previousAction.payload["simulation-name"];
  const className = action.meta.previousAction.payload["class-name"];
  const redirect = action.meta.previousAction.payload.redirect;

  yield put(fetchSimulatedSystemsServer({ "simulation-name": simulationName }));
  yield put(
    setSimulatedSystemsAlertData({
      isVisible: true,
      text: `Simulated system ${className} was successfully updated`,
    }),
  );

  if (redirect) redirect();
}

function* editSimulatedSystemServerFail(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield put(setSimulatedSystemsValidationErrors(response));
}

export default simulatedSystemsSaga;
