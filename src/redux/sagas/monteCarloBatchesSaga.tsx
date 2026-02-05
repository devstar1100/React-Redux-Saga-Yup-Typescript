import { put, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import {
  GET_MONTECARLOBATCHESLIST_SERVER,
  updateAreMonteCarloBatchesListLoading,
  updateMonteCarloBatchesList,
} from "../actions/MonteCarloBatchesActions";
import { failActionType } from "../../lib/failActionType";
import { MonteCarloBatch } from "../../types/monteCarloBatches";

const monteCarloBatchesSaga = [
  takeEvery(GET_MONTECARLOBATCHESLIST_SERVER, getMonteCarloBatchesListHandler),
  takeEvery(successActionType(GET_MONTECARLOBATCHESLIST_SERVER), getMonteCarloBatchesListSuccessHandler),
  takeEvery(failActionType(GET_MONTECARLOBATCHESLIST_SERVER), getMonteCarloBatchesListFailHandler),
];

function* getMonteCarloBatchesListHandler() {
  yield put(updateAreMonteCarloBatchesListLoading(true));
}

function* getMonteCarloBatchesListSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloBatch[];

  yield put(updateMonteCarloBatchesList(response));
  yield put(updateAreMonteCarloBatchesListLoading(false));
}

function* getMonteCarloBatchesListFailHandler() {
  yield put(updateAreMonteCarloBatchesListLoading(false));
}

export default monteCarloBatchesSaga;
