import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  ADD_MONTECARLO_FILE_SERVER,
  CLONE_MONTECARLO_FILE_SERVER,
  DELETE_MONTECARLO_FILE_SERVER,
  EDIT_MONTECARLO_FILE_SERVER,
  GET_MONTECARLO_FILES_SERVER,
  getMonteCarloFilesServer,
  updateIsMonteCarloFilesLoading,
  updateMonteCarloFilesData,
  updateMonteCarloFileValidationErrors,
} from "../actions/monteCarloFilesActions";
import { MonteCarloFile } from "../../types/monteCarloFile";
import { getCurrentMonteCarloFiles } from "../reducers/monteCarloFilesReducer";
import { toast } from "react-toastify";
import { ValidationError } from "../../types/validationError";

const monteCarloFilesSaga = [
  takeEvery(GET_MONTECARLO_FILES_SERVER, monteCarloFilesServerHandler),
  takeEvery(successActionType(GET_MONTECARLO_FILES_SERVER), getMonteCarloFilesServerSuccessHandler),
  takeEvery(failActionType(GET_MONTECARLO_FILES_SERVER), getMonteCarloFilesServerFailHandler),

  takeEvery(CLONE_MONTECARLO_FILE_SERVER, monteCarloFilesServerHandler),
  takeEvery(successActionType(CLONE_MONTECARLO_FILE_SERVER), cloneMonteCarloFileServerSuccessHandler),
  takeEvery(failActionType(CLONE_MONTECARLO_FILE_SERVER), cloneMonteCarloFileServerFailHandler),

  takeEvery(DELETE_MONTECARLO_FILE_SERVER, monteCarloFilesServerHandler),
  takeEvery(successActionType(DELETE_MONTECARLO_FILE_SERVER), deleteMonteCarloFileServerSuccessHandler),
  takeEvery(failActionType(DELETE_MONTECARLO_FILE_SERVER), deleteMonteCarloFileServerFailHandler),

  takeEvery(EDIT_MONTECARLO_FILE_SERVER, monteCarloFilesServerHandler),
  takeEvery(successActionType(EDIT_MONTECARLO_FILE_SERVER), editMonteCarloFileSuccessHandler),
  takeEvery(failActionType(EDIT_MONTECARLO_FILE_SERVER), addEditMonteCarloFileFailHandler),

  takeEvery(ADD_MONTECARLO_FILE_SERVER, monteCarloFilesServerHandler),
  takeEvery(successActionType(ADD_MONTECARLO_FILE_SERVER), addMonteCarloFileSuccessHandler),
  takeEvery(failActionType(ADD_MONTECARLO_FILE_SERVER), addEditMonteCarloFileFailHandler),
];

function* monteCarloFilesServerHandler() {
  yield put(updateIsMonteCarloFilesLoading(true));
}

function* getMonteCarloFilesServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile[];
  yield put(updateMonteCarloFilesData(response));
  yield put(updateIsMonteCarloFilesLoading(false));
}

function* getMonteCarloFilesServerFailHandler() {
  yield put(updateIsMonteCarloFilesLoading(false));
}

function* deleteMonteCarloFileServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile;
  yield put(getMonteCarloFilesServer());
  yield put(updateIsMonteCarloFilesLoading(false));
  toast.success(`MonteCarloBatch I/O File ${response["simulation-id"]} was successfully deleted`);
}

function* deleteMonteCarloFileServerFailHandler() {
  yield put(updateIsMonteCarloFilesLoading(false));
}

function* cloneMonteCarloFileServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile;
  const currentMonteCarloFiles = getCurrentMonteCarloFiles(yield select());
  const nextMonteCarloFiles = [...currentMonteCarloFiles, response];
  yield put(updateMonteCarloFilesData(nextMonteCarloFiles));
  yield put(updateIsMonteCarloFilesLoading(false));
  toast.success(`MonteCarloBatch I/O File ${response["simulation-id"]} was successfully duplicated`);
}

function* cloneMonteCarloFileServerFailHandler() {
  yield put(updateIsMonteCarloFilesLoading(false));
}

function* editMonteCarloFileSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile;
  const currentMonteCarloFiles = getCurrentMonteCarloFiles(yield select());
  const nextMonteCarloFiles = currentMonteCarloFiles.map((item) =>
    item["simulation-id"] === response["simulation-id"] && item["name"] === response["name"]
      ? { ...item, ...response }
      : item,
  );
  yield put(updateMonteCarloFilesData(nextMonteCarloFiles));
  yield put(updateIsMonteCarloFilesLoading(false));
  toast.success(`MonteCarloBatch I/O File ${response["name"]} was successfully updated`);
  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addMonteCarloFileSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile;
  const currentMonteCarloFiles = getCurrentMonteCarloFiles(yield select());
  const nextMonteCarloFiles = [...currentMonteCarloFiles, response];
  yield put(updateMonteCarloFilesData(nextMonteCarloFiles));
  yield put(updateIsMonteCarloFilesLoading(false));
  toast.success(`MonteCarloBatch I/O File ${response["name"]} was successfully added`);
  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}
function* addEditMonteCarloFileFailHandler(action: any) {
  const response = action.error.response.data as ValidationError[];
  yield put(updateMonteCarloFileValidationErrors(response));
  yield put(updateIsMonteCarloFilesLoading(false));
}

export default monteCarloFilesSaga;
