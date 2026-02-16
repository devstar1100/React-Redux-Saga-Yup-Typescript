import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  CLONE_MONTECARLO_FILE_SERVER,
  GET_MONTECARLO_FILES_SERVER,
  updateIsMonteCarloFilesLoading,
  updateMonteCarloFilesData,
} from "../actions/monteCarloFilesActions";
import { MonteCarloFile } from "../../types/monteCarloFile";
import { getCurrentMonteCarloFiles } from "../reducers/monteCarloFilesReduce";
import { toast } from "react-toastify";

const monteCarloFilesSaga = [
  takeEvery(GET_MONTECARLO_FILES_SERVER, getMonteCarloFilesServerHandler),
  takeEvery(successActionType(GET_MONTECARLO_FILES_SERVER), getMonteCarloFilesServerSuccessHandler),
  takeEvery(failActionType(GET_MONTECARLO_FILES_SERVER), getMonteCarloFilesServerFailHandler),

  takeEvery(successActionType(CLONE_MONTECARLO_FILE_SERVER), cloneMonteCarloFileServerSuccessHandler),
  takeEvery(failActionType(CLONE_MONTECARLO_FILE_SERVER), cloneMonteCarloFileServerFailHandler),
];

function* getMonteCarloFilesServerHandler() {
  yield put(updateIsMonteCarloFilesLoading(true));
}

function* getMonteCarloFilesServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile[];

  yield put(updateIsMonteCarloFilesLoading(false));
  yield put(updateMonteCarloFilesData(response));
}

function* getMonteCarloFilesServerFailHandler() {
  yield put(updateIsMonteCarloFilesLoading(false));
}

function* cloneMonteCarloFileServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloFile;
  const currentMonteCarloFiles = getCurrentMonteCarloFiles(yield select());
  const nextMonteCarloFiles = [...currentMonteCarloFiles, response];
  yield put(updateMonteCarloFilesData(nextMonteCarloFiles));
  toast.success(`MonteCarloBatch ${response["simulation-id"]} was successfully duplicated`);
}

function* cloneMonteCarloFileServerFailHandler(action: any) {
  const response = action.payload.data as MonteCarloFile;
  yield toast.error(`MonteCarloBatch ${response["simulation-id"]} was not duplicated`);
}

export default monteCarloFilesSaga;
