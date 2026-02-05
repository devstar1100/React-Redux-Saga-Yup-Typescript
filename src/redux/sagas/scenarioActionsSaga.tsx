import { put, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER,
  GET_SCENARIO_LIST_ACTIONS_SERVER,
  MANAGE_SCENARIO_LIST_ACTIONS_SERVER,
  getScenarioListActionsServer,
  updateIsScenarioListActionsLoading,
  updateScenarioActionsValidationErrors,
  updateScenarioListActionsData,
} from "../actions/scenarioListActions";
import { ScenarioAction } from "../../types/scenarioAction";
import { ValidationError } from "../../types/validationError";

const scenarioActionsSaga = [
  takeEvery(GET_SCENARIO_LIST_ACTIONS_SERVER, getScenarioActionsServerHandler),
  takeEvery(successActionType(GET_SCENARIO_LIST_ACTIONS_SERVER), getScenarioActionsServerSuccessHandler),
  takeEvery(failActionType(GET_SCENARIO_LIST_ACTIONS_SERVER), getScenarioActionsServerFailHandler),

  takeEvery(ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER, addEditScenarioActionServerHandler),
  takeEvery(successActionType(ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER), addEditScenarioActionServerSuccessHandler),
  takeEvery(failActionType(ADD_EDIT_SCENARIO_LIST_ACTIONS_SERVER), addEditScenarioActionServerFailHandler),

  takeEvery(MANAGE_SCENARIO_LIST_ACTIONS_SERVER, manageScenarioActionServerHandler),
  takeEvery(successActionType(MANAGE_SCENARIO_LIST_ACTIONS_SERVER), manageScenarioActionServerSuccessHandler),
  takeEvery(failActionType(MANAGE_SCENARIO_LIST_ACTIONS_SERVER), manageScenarioActionServerFailHandler),
];

function* getScenarioActionsServerHandler() {
  yield put(updateIsScenarioListActionsLoading(true));
}

function* getScenarioActionsServerSuccessHandler(action: any) {
  const response = action.payload.data as ScenarioAction[];

  yield put(updateIsScenarioListActionsLoading(false));
  yield put(updateScenarioListActionsData(response));
}

function* getScenarioActionsServerFailHandler() {
  yield put(updateIsScenarioListActionsLoading(false));
}

function* addEditScenarioActionServerHandler() {
  yield put(updateIsScenarioListActionsLoading(true));
}

function* addEditScenarioActionServerSuccessHandler(action: any) {
  const redirect = action.meta.previousAction.payload.redirect;
  yield put(updateIsScenarioListActionsLoading(false));
  redirect();
}

function* addEditScenarioActionServerFailHandler(action: any) {
  yield put(updateIsScenarioListActionsLoading(false));

  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield put(updateScenarioActionsValidationErrors(response));
}

function* manageScenarioActionServerHandler() {
  yield put(updateIsScenarioListActionsLoading(true));
}

function* manageScenarioActionServerSuccessHandler(action: any) {
  const scenarioFileId = action.meta.previousAction.payload.scenarioFileId;

  yield put(getScenarioListActionsServer(scenarioFileId));
  yield put(updateIsScenarioListActionsLoading(false));
}

function* manageScenarioActionServerFailHandler() {
  yield put(updateIsScenarioListActionsLoading(false));
}

export default scenarioActionsSaga;
