import { put, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  ADD_EDIT_SCENARIO_FILE_SERVER,
  GET_SCENARIO_FILES_SERVER,
  MANAGE_SCENARIO_FILE_SERVER,
  getScenarioFilesServer,
  updateIsScenarioFilesLoading,
  updateScenarioFilesData,
  updateScenarioFilesValidationErrors,
} from "../actions/scenarioFilesActions";
import { ScenarioFile } from "../../types/scenarioFile";
import { ValidationError } from "../../types/validationError";
import { toast } from "react-toastify";

const scenarioFilesSaga = [
  takeEvery(GET_SCENARIO_FILES_SERVER, getScenarioFilesServerHandler),
  takeEvery(successActionType(GET_SCENARIO_FILES_SERVER), getScenarioFilesServerSuccessHandler),
  takeEvery(failActionType(GET_SCENARIO_FILES_SERVER), getScenarioFilesServerFailHandler),

  takeEvery(ADD_EDIT_SCENARIO_FILE_SERVER, addEditScenarioFileServerHandler),
  takeEvery(successActionType(ADD_EDIT_SCENARIO_FILE_SERVER), addEditScenarioFileServerSuccessHandler),
  takeEvery(failActionType(ADD_EDIT_SCENARIO_FILE_SERVER), addEditScenarioFileServerFailHandler),

  takeEvery(MANAGE_SCENARIO_FILE_SERVER, manageScenarioFileServerHandler),
  takeEvery(successActionType(MANAGE_SCENARIO_FILE_SERVER), manageScenarioFileServerSuccessHandler),
  takeEvery(failActionType(MANAGE_SCENARIO_FILE_SERVER), manageScenarioFileServerFailHandler),
];

function* getScenarioFilesServerHandler() {
  yield put(updateIsScenarioFilesLoading(true));
}

function* getScenarioFilesServerSuccessHandler(action: any) {
  const response = action.payload.data as ScenarioFile[];

  yield put(updateIsScenarioFilesLoading(false));
  yield put(updateScenarioFilesData(response));
}

function* getScenarioFilesServerFailHandler() {
  yield put(updateIsScenarioFilesLoading(false));
}

function* addEditScenarioFileServerHandler() {
  yield put(updateIsScenarioFilesLoading(true));
}

function* addEditScenarioFileServerSuccessHandler(action: any) {
  const redirect = action.meta.previousAction.payload.redirect;
  const successMessage = action.meta.previousAction.payload.successMessage;

  toast.success(successMessage);
  yield put(updateIsScenarioFilesLoading(false));
  redirect();
}

function* addEditScenarioFileServerFailHandler(action: any) {
  yield put(updateIsScenarioFilesLoading(false));

  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield put(updateScenarioFilesValidationErrors(response));
}

function* manageScenarioFileServerHandler() {
  yield put(updateIsScenarioFilesLoading(true));
}

function* manageScenarioFileServerSuccessHandler() {
  yield put(getScenarioFilesServer());
  yield put(updateIsScenarioFilesLoading(false));
}

function* manageScenarioFileServerFailHandler() {
  yield put(updateIsScenarioFilesLoading(false));
}

export default scenarioFilesSaga;
