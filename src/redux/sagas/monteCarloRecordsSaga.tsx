import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import {
  ADD_MONTECARLO_RECORD_SERVER,
  CLONE_MONTECARLO_RECORD_SERVER,
  DELETE_MONTECARLO_RECORD_SERVER,
  EDIT_MONTECARLO_RECORD_SERVER,
  GET_MONTECARLO_RECORDS_SERVER,
  updateIsMonteCarloRecordsLoading,
  updateMonteCarloRecordsData,
  updateMonteCarloRecordValidationErrors,
} from "../actions/monteCarloRecordsActions";
import { getCurrentMonteCarloRecords } from "../reducers/monteCarloRecordsReducer";
import { toast } from "react-toastify";
import { ValidationError } from "../../types/validationError";
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

  takeEvery(EDIT_MONTECARLO_RECORD_SERVER, monteCarloRecordsServerHandler),
  takeEvery(successActionType(EDIT_MONTECARLO_RECORD_SERVER), editMonteCarloRecordSuccessHandler),
  takeEvery(failActionType(EDIT_MONTECARLO_RECORD_SERVER), addEditMonteCarloRecordFailHandler),

  takeEvery(ADD_MONTECARLO_RECORD_SERVER, monteCarloRecordsServerHandler),
  takeEvery(successActionType(ADD_MONTECARLO_RECORD_SERVER), addMonteCarloRecordSuccessHandler),
  takeEvery(failActionType(ADD_MONTECARLO_RECORD_SERVER), addEditMonteCarloRecordFailHandler),
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

function* editMonteCarloRecordSuccessHandler(action: any) {
  yield put(updateIsMonteCarloRecordsLoading(false));
  toast.success(`MonteCarloBatch I/O Record was successfully updated`);
  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addMonteCarloRecordSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloRecord;
  const currentMonteCarloRecords = getCurrentMonteCarloRecords(yield select());
  const nextMonteCarloRecords = [...currentMonteCarloRecords, response];
  yield put(updateMonteCarloRecordsData(nextMonteCarloRecords));
  yield put(updateIsMonteCarloRecordsLoading(false));
  toast.success(`MonteCarloBatch I/O Record was successfully added`);
  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}
function* addEditMonteCarloRecordFailHandler(action: any) {
  const response = action.error.response.data as ValidationError[];
  yield put(updateMonteCarloRecordValidationErrors(response));
  yield put(updateIsMonteCarloRecordsLoading(false));
}

export default monteCarloRecordsSaga;
