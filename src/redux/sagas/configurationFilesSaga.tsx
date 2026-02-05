import { put, select, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";

import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  ADD_CONFIGURATION_FILE_SERVER,
  DELETE_CONFIGURATION_FILE_SERVER,
  DUPLICATE_CONFIGURATION_FILE_SERVER,
  EDIT_CONFIGURATION_FILE_SERVER,
  GET_CONFIGURATION_FILES_SERVER,
  getConfigurationFilesServer,
  updateConfigFileValidationErrors,
  updateConfigurationFiles,
  updateConfigurationFilesLoading,
} from "../actions/configurationFilesActions";
import { ConfigurationFile } from "../../types/configurationFile";
import { getConfigurationFiles } from "../reducers/configurationFilesReducer";
import { ValidationError } from "../../types/validationError";

const configurationFilesSaga = [
  takeEvery(GET_CONFIGURATION_FILES_SERVER, getConfigurationFilesHandler),
  takeEvery(successActionType(GET_CONFIGURATION_FILES_SERVER), getConfigurationFilesSuccessHandler),
  takeEvery(failActionType(GET_CONFIGURATION_FILES_SERVER), getConfigurationFilesFailHandler),

  takeEvery(successActionType(ADD_CONFIGURATION_FILE_SERVER), addConfigurationFileSuccessHandler),
  takeEvery(failActionType(ADD_CONFIGURATION_FILE_SERVER), addEditConfigurationFileFailHandler),

  takeEvery(successActionType(EDIT_CONFIGURATION_FILE_SERVER), editConfigurationFileSuccessHandler),
  takeEvery(failActionType(EDIT_CONFIGURATION_FILE_SERVER), addEditConfigurationFileFailHandler),

  takeEvery(successActionType(DELETE_CONFIGURATION_FILE_SERVER), deleteConfigurationFileSuccessHandler),
  takeEvery(failActionType(DELETE_CONFIGURATION_FILE_SERVER), deleteConfigurationFileFailHandler),

  takeEvery(successActionType(DUPLICATE_CONFIGURATION_FILE_SERVER), duplicateConfigurationFileSuccessHandler),
  takeEvery(failActionType(DUPLICATE_CONFIGURATION_FILE_SERVER), duplicateConfigurationFileFailHandler),
];

function* getConfigurationFilesHandler() {
  yield put(updateConfigurationFilesLoading(true));
}

function* getConfigurationFilesSuccessHandler(action: any) {
  const response = action.payload.data as ConfigurationFile[];

  yield put(updateConfigurationFiles(response));
  yield put(updateConfigurationFilesLoading(false));
}

function* getConfigurationFilesFailHandler() {
  yield put(updateConfigurationFilesLoading(false));
}

function* addConfigurationFileSuccessHandler(action: any) {
  const redirect = action.meta.previousAction.payload.redirect;

  const response = action.payload.data as ConfigurationFile;
  const filesList = getConfigurationFiles(yield select());

  const nextFilesList = [...filesList, response];

  yield put(updateConfigFileValidationErrors([]));
  yield put(updateConfigurationFiles(nextFilesList));
  toast.success(`Simulation configuration for simulation ${response["simulation-name"]} was successfully added`);
  redirect?.();
}

function* addEditConfigurationFileFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];
  yield put(updateConfigFileValidationErrors(response));
}

function* editConfigurationFileSuccessHandler(action: any) {
  const redirect = action.meta.previousAction.payload.redirect;
  const response = action.payload.data as ConfigurationFile;
  const filesList = getConfigurationFiles(yield select());

  const nextFilesList = filesList.map((item) =>
    item["simulation-user-config-id"] === response["simulation-user-config-id"] ? { ...item, ...response } : item,
  );

  yield put(updateConfigFileValidationErrors([]));
  yield put(updateConfigurationFiles(nextFilesList));
  toast.success(`Simulation configuration for simulation ${response["simulation-name"]} was successfully updated`);
  redirect?.();
}

function* deleteConfigurationFileSuccessHandler(action: any) {
  const response = action.payload.data as ConfigurationFile;
  const filesList = getConfigurationFiles(yield select());

  const nextFilesList = filesList.filter(
    (item) => item["simulation-user-config-id"].toString() !== response["simulation-user-config-id"].toString(),
  );
  toast.success(`Configuration files was successfully deleted`);

  yield put(updateConfigurationFiles(nextFilesList));
}

function* deleteConfigurationFileFailHandler() {
  yield toast.error("Error while deleting configuration file");
}

function* duplicateConfigurationFileSuccessHandler() {
  toast.success("Configuration file was successfully duplicated");

  yield put(getConfigurationFilesServer({}));
}

function* duplicateConfigurationFileFailHandler() {
  yield toast.error("Error while duplicating configuration file");
}

export default configurationFilesSaga;
