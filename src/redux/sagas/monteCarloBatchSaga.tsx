import {
  ADD_MONTECARLOBATCH_SERVER,
  CLONE_MONTECARLOBATCH_SERVER,
  DELETE_MONTECARLOBATCH_SERVER,
  EDIT_MONTECARLOBATCH_SERVER,
  updateMonteCarloBatchValidationErrors,
} from "../actions/MonteCarloBatchActions";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import { getMonteCarloBatches } from "../reducers/monteCarloBatchesReducer";
import { updateMonteCarloBatchesList } from "../actions/MonteCarloBatchesActions";
import { put, select, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import { failActionType } from "../../lib/failActionType";
import { toast } from "react-toastify";
import { ValidationError } from "../../types/validationError";

const MonteCarloBatchSaga = [
  takeEvery(successActionType(DELETE_MONTECARLOBATCH_SERVER), deleteMonteCarloBatchSuccessHandler),
  takeEvery(failActionType(DELETE_MONTECARLOBATCH_SERVER), deleteMonteCarloBatchFailHandler),

  takeEvery(successActionType(CLONE_MONTECARLOBATCH_SERVER), cloneMonteCarloBatchSuccessHandler),
  takeEvery(failActionType(CLONE_MONTECARLOBATCH_SERVER), cloneMonteCarloBatchFailHandler),

  takeEvery(successActionType(EDIT_MONTECARLOBATCH_SERVER), editMonteCarloBatchSuccessHandler),
  takeEvery(failActionType(EDIT_MONTECARLOBATCH_SERVER), addEditMonteCarloBatchFailHandler),
  takeEvery(successActionType(ADD_MONTECARLOBATCH_SERVER), addMonteCarloBatchSuccessHandler),
  takeEvery(failActionType(ADD_MONTECARLOBATCH_SERVER), addEditMonteCarloBatchFailHandler),
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

function* editMonteCarloBatchSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloBatch;
  const monteCarloBatchesList = getMonteCarloBatches(yield select());

  const nextMonteCarloBatches = monteCarloBatchesList.map((item) =>
    item["simulation-id"] === response["simulation-id"] ? { ...item, ...response } : item,
  );

  yield put(updateMonteCarloBatchesList(nextMonteCarloBatches));
  toast.success(`MonteCarloBatch ${response["batch-id"]} was successfully updated`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addMonteCarloBatchSuccessHandler(action: any) {
  const response = action.payload.data as MonteCarloBatch;
  const MonteCarloBatchesList = getMonteCarloBatches(yield select());

  const nextMonteCarloBatchesList = [...MonteCarloBatchesList, response];

  yield put(updateMonteCarloBatchesList(nextMonteCarloBatchesList));
  toast.success(`MonteCarloBatch ${response["batch-id"]} was successfully added`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addEditMonteCarloBatchFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];
  yield put(updateMonteCarloBatchValidationErrors(response));
}

export default MonteCarloBatchSaga;
