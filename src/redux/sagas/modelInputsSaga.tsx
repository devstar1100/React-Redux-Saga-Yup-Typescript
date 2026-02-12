import { put, select, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";

import { failActionType } from "../../lib/failActionType";
import { successActionType } from "../../lib/successActionType";
import {
  ADD_MODEL_INPUT_SERVER,
  CLONE_MODEL_INPUTS_SERVER,
  DELETE_MODEL_INPUTS_SERVER,
  EDIT_MODEL_INPUT_SERVER,
  FETCH_LIST_MODELS_SERVER,
  FETCH_MODEL_INPUTS_SERVER,
  fetchModelInputsServer,
  setModelInputsLoading,
  setModelInputsValidationErrors,
  setStoredListModels,
  setStoredModelInputs,
  updateModelInputAlertData,
} from "../actions/modelInputsActions";
import { IModel, IModelInput } from "../../types/modelInput";
import { ValidationError } from "../../types/validationError";

const modelInputsSaga = [
  takeEvery(FETCH_MODEL_INPUTS_SERVER, fetchModelInputsServerHandler),
  takeEvery(successActionType(FETCH_MODEL_INPUTS_SERVER), fetchModelInputsServerSuccess),
  takeEvery(failActionType(FETCH_MODEL_INPUTS_SERVER), fetchModelInputsServerFail),

  takeEvery(successActionType(CLONE_MODEL_INPUTS_SERVER), cloneModelInputsServerSuccess),
  takeEvery(failActionType(CLONE_MODEL_INPUTS_SERVER), cloneModelInputsServerFail),

  takeEvery(successActionType(DELETE_MODEL_INPUTS_SERVER), deleteModelInputsServerSuccess),
  takeEvery(failActionType(DELETE_MODEL_INPUTS_SERVER), deleteModelInputsServerFail),

  takeEvery(FETCH_LIST_MODELS_SERVER, fetchListModelsServerHandler),
  takeEvery(successActionType(FETCH_LIST_MODELS_SERVER), fetchListModelsServerSuccess),
  takeEvery(failActionType(FETCH_LIST_MODELS_SERVER), fetchListModelsServerFail),

  takeEvery(successActionType(ADD_MODEL_INPUT_SERVER), addModelInputServerSuccessHandler),
  takeEvery(failActionType(ADD_MODEL_INPUT_SERVER), addModelInputServerFailHandler),

  takeEvery(successActionType(EDIT_MODEL_INPUT_SERVER), editModelInputServerSuccessHandler),
  takeEvery(failActionType(EDIT_MODEL_INPUT_SERVER), editModelInputServerFailHandler),
];

function* fetchModelInputsServerHandler() {
  yield put(setModelInputsLoading(true));
}

function* fetchModelInputsServerSuccess(action: any) {
  const response = action.payload.data as IModelInput[];

  yield put(setStoredModelInputs(response));
  yield put(setModelInputsLoading(false));
}

function* fetchModelInputsServerFail(action: any) {
  yield put(setModelInputsLoading(false));
}

function* cloneModelInputsServerSuccess(action: any) {
  const simulationName = action.meta.previousAction.payload.request.params["simulation-name"];

  yield put(fetchModelInputsServer({ "simulation-name": simulationName }));
  yield toast.success("Model input successfully cloned");
}

function* cloneModelInputsServerFail() {
  yield toast.success("Error while cloning model input");
}

function* deleteModelInputsServerSuccess(action: any) {
  const { simulationName } = action.meta.previousAction.payload;

  yield put(fetchModelInputsServer({ "simulation-name": simulationName }));
  toast.success("Model input successfully deleted");
}

function* deleteModelInputsServerFail() {
  yield toast.error("Error while deleting model input");
}

function* fetchListModelsServerHandler() {
  yield put(setModelInputsLoading(true));
}

function* fetchListModelsServerSuccess(action: any) {
  const response = action.payload.data as IModel[];
  yield put(setStoredListModels(response));
}

function* fetchListModelsServerFail(action: any) {
  yield put(setModelInputsLoading(false));
}

function* addModelInputServerSuccessHandler(action: any) {
  const { redirect, simulationName, structureName } = action.meta.previousAction.payload;
  yield put(
    updateModelInputAlertData({
      isVisible: true,
      text: `Model input ${structureName} was successfully added`,
    }),
  );
  yield put(fetchModelInputsServer({ "simulation-name": simulationName }));
  redirect();
}

function* addModelInputServerFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield put(setModelInputsValidationErrors(response));
}

function* editModelInputServerSuccessHandler(action: any) {
  const { redirect, simulationName, structureName } = action.meta.previousAction.payload;

  yield put(
    updateModelInputAlertData({
      isVisible: true,
      text: `Model input ${structureName} was successfully edited`,
    }),
  );
  yield put(fetchModelInputsServer({ "simulation-name": simulationName }));
  redirect();
}

function* editModelInputServerFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield put(setModelInputsValidationErrors(response));
}

export default modelInputsSaga;
