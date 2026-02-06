import { CLONE_MONTECARLOBATCH_SERVER, DELETE_MONTECARLOBATCH_SERVER } from "../actions/MonteCarloBatchActions";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import { getMonteCarloBatches } from "../reducers/monteCarloBatchesReducer";
import { updateMonteCarloBatchesList } from "../actions/MonteCarloBatchesActions";
import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import { toast } from "react-toastify";

const MonteCarloBatchSaga = [
  takeEvery(successActionType(DELETE_MONTECARLOBATCH_SERVER), deleteMonteCarloBatchSuccessHandler),
  takeEvery(failActionType(DELETE_MONTECARLOBATCH_SERVER), deleteMonteCarloBatchFailHandler),

  takeEvery(successActionType(CLONE_MONTECARLOBATCH_SERVER), cloneMonteCarloBatchSuccessHandler),
  takeEvery(failActionType(CLONE_MONTECARLOBATCH_SERVER), cloneMonteCarloBatchFailHandler),
];

function* deleteMonteCarloBatchSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloBatch;
  const MonteCarloBatchesList = getMonteCarloBatches(yield select());

  const nextMonteCarloBatchesList = MonteCarloBatchesList.filter(
    (item) => item["batch-id"].toString() !== response["batch-id"].toString(),
  );

  yield put(updateMonteCarloBatchesList(nextMonteCarloBatchesList));
  toast.success(`MonteCarloBatch was successfully deleted`);
}

function* deleteMonteCarloBatchFailHandler() {
  // whatever;
}

function* cloneMonteCarloBatchSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloBatch;
  const MonteCarloBatchesList = getMonteCarloBatches(yield select());

  const nextMonteCarloBatchesList = [...MonteCarloBatchesList, response];

  yield put(updateMonteCarloBatchesList(nextMonteCarloBatchesList));
  toast.success(`MonteCarloBatch ${response["batch-id"]} was successfully duplicated`);
}

function* cloneMonteCarloBatchFailHandler() {
  // whatever;
}

export default MonteCarloBatchSaga;
