import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  CLONE_MONTECARLO_RECORD_SERVER,
  DELETE_MONTECARLO_RECORD_SERVER,
  GET_MONTECARLO_RECORDS_SERVER,
  updateIsMonteCarloRecordsLoading,
  updateMonteCarloRecordsData,
} from "../actions/monteCarloRecordsActions";
import { getCurrentMonteCarloRecords } from "../reducers/monteCarloRecordsReducer";
import { toast } from "react-toastify";
import { MonteCarloRecord } from "../../types/monteCarloRecords";

const monteCarloRecordsSaga = [
  takeEvery(GET_MONTECARLO_RECORDS_SERVER, monteCarloRecordsServerHandler),
  takeEvery(successActionType(GET_MONTECARLO_RECORDS_SERVER), getMonteCarloRecordsServerSuccessHandler),
  takeEvery(failActionType(GET_MONTECARLO_RECORDS_SERVER), getMonteCarloRecordsServerFailHandler),

  takeEvery(CLONE_MONTECARLO_RECORD_SERVER, monteCarloRecordsServerHandler),
  takeEvery(successActionType(CLONE_MONTECARLO_RECORD_SERVER), cloneMonteCarloRecordServerSuccessHandler),
  takeEvery(failActionType(CLONE_MONTECARLO_RECORD_SERVER), cloneMonteCarloRecordServerFailHandler),

  takeEvery(DELETE_MONTECARLO_RECORD_SERVER, monteCarloRecordsServerHandler),
  takeEvery(successActionType(DELETE_MONTECARLO_RECORD_SERVER), deleteMonteCarloRecordServerSuccessHandler),
  takeEvery(failActionType(DELETE_MONTECARLO_RECORD_SERVER), deleteMonteCarloRecordServerFailHandler),
];

function* monteCarloRecordsServerHandler() {
  yield put(updateIsMonteCarloRecordsLoading(true));
}

function* getMonteCarloRecordsServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloRecord[];
  yield put(updateMonteCarloRecordsData(response));
  yield put(updateIsMonteCarloRecordsLoading(false));
}

function* getMonteCarloRecordsServerFailHandler() {
  yield put(updateIsMonteCarloRecordsLoading(false));
}

function* deleteMonteCarloRecordServerSuccessHandler(action: any) {
  const response = action.meta.previousAction.payload.request.params;
  const currenBatchRecords = getCurrentMonteCarloRecords(yield select());
  const nextBatchRecords = currenBatchRecords.filter(
    (item) => item["description"].toString() !== response.description.toString(),
  );
  yield put(updateMonteCarloRecordsData(nextBatchRecords));
  yield put(updateIsMonteCarloRecordsLoading(false));
  toast.success(`MonteCarloBatch I/O Record was successfully deleted`);
}

function* deleteMonteCarloRecordServerFailHandler() {
  yield put(updateIsMonteCarloRecordsLoading(false));
}

function* cloneMonteCarloRecordServerSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloRecord;
  const currentMonteCarloRecords = getCurrentMonteCarloRecords(yield select());
  const nextMonteCarloRecords = [...currentMonteCarloRecords, response];
  yield put(updateMonteCarloRecordsData(nextMonteCarloRecords));
  yield put(updateIsMonteCarloRecordsLoading(false));
  toast.success(`MonteCarloBatch I/O Record was successfully duplicated`);
}

function* cloneMonteCarloRecordServerFailHandler() {
  yield put(updateIsMonteCarloRecordsLoading(false));
}

export default monteCarloRecordsSaga;
