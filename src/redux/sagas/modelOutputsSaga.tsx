import { put, select, takeEvery } from "redux-saga/effects";

import { failActionType } from "../../lib/failActionType";
import { successActionType } from "../../lib/successActionType";
import {
  ADD_MODEL_OUTPUT_SERVER,
  CLONE_MODEL_OUTPUT_SERVER,
  DELETE_MODEL_OUTPUT_SERVER,
  EDIT_MODEL_OUTPUT_SERVER,
  FETCH_MODEL_OUTPUTS_LIST_SERVER,
  fetchModelOutputsListServer,
  updateModelOutputAlertData,
  updateModelOutputsLoading,
  updateModelOutputsValidationErrors,
  updateStoredModelOutputsList,
} from "../actions/modelOutputsActions";
import { toast } from "react-toastify";
import { getStoredModelOutputs } from "../reducers/modelOutputsReducer";
import { ValidationError } from "../../types/validationError";
import { IModelOutput } from "../../types/modelOutput";

const modelOutputsSaga = [
  takeEvery(FETCH_MODEL_OUTPUTS_LIST_SERVER, fetchModelOutputsServerHandler),
  takeEvery(successActionType(FETCH_MODEL_OUTPUTS_LIST_SERVER), fetchModelOutputsServerSuccess),
  takeEvery(failActionType(FETCH_MODEL_OUTPUTS_LIST_SERVER), fetchModelOutputsServerFail),

  // takeEvery(ADD_MODEL_OUTPUT_SERVER, addModelOutputServerHandler),
  takeEvery(successActionType(ADD_MODEL_OUTPUT_SERVER), addModelOutputServerSuccessHandler),
  takeEvery(failActionType(ADD_MODEL_OUTPUT_SERVER), addModelOutputServerFailHandler),

  // takeEvery(EDIT_MODEL_OUTPUT_SERVER, editModelOutputServerHandler),
  takeEvery(successActionType(EDIT_MODEL_OUTPUT_SERVER), editModelOutputServerSuccessHandler),
  takeEvery(failActionType(EDIT_MODEL_OUTPUT_SERVER), editModelOutputServerFailHandler),

  takeEvery(successActionType(CLONE_MODEL_OUTPUT_SERVER), cloneModelOutputServerSuccessHandler),
  takeEvery(failActionType(CLONE_MODEL_OUTPUT_SERVER), cloneModelOutputServerFailHandler),

  takeEvery(successActionType(DELETE_MODEL_OUTPUT_SERVER), deleteModelOutputServerSuccessHandler),
  takeEvery(failActionType(DELETE_MODEL_OUTPUT_SERVER), deleteModelOutputServerFailHandler),
];

function* fetchModelOutputsServerHandler() {
  yield put(updateModelOutputsLoading(true));
}

function* fetchModelOutputsServerSuccess(action: any) {
  const response = action.payload.data as IModelOutput[];

  yield put(updateStoredModelOutputsList(response));
  yield put(updateModelOutputsLoading(false));
}

function* fetchModelOutputsServerFail(action: any) {
  yield put(updateModelOutputsLoading(false));
}

// function* addModelOutputServerHandler() {}

function* addModelOutputServerSuccessHandler(action: any) {
  const { redirect, simulationName, structureName } = action.meta.previousAction.payload;

  yield put(
    updateModelOutputAlertData({
      isVisible: true,
      text: `Model output ${structureName} was successfully added`,
    }),
  );
  yield put(
    fetchModelOutputsListServer({
      "simulation-name": simulationName,
    }),
  );

  redirect(redirect);
}

function* addModelOutputServerFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  yield toast.error("Error while adding model output");
  yield put(updateModelOutputsValidationErrors(response));
}

// function* editModelOutputServerHandler() {}

function* editModelOutputServerSuccessHandler(action: any) {
  const { redirect, simulationName, structureName } = action.meta.previousAction.payload;

  yield put(
    updateModelOutputAlertData({
      isVisible: true,
      text: `Model output ${structureName} was successfully updated`,
    }),
  );
  yield put(
    fetchModelOutputsListServer({
      "simulation-name": simulationName,
    }),
  );

  redirect();
}

function* editModelOutputServerFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  toast.error("Error while updating model output", { toastId: "error-model-output-updating" });
  yield put(updateModelOutputsValidationErrors(response));
}

function* cloneModelOutputServerSuccessHandler(action: any) {
  const modelOutputId = action.meta.previousAction.payload?.request?.url?.split("/")[3];
  const storedModelOutputs: IModelOutput[] = yield select(getStoredModelOutputs);

  const clonedElemIndex = storedModelOutputs.findIndex((model) => model["model-output-id"] === Number(modelOutputId));

  const newModelOutputs = [
    ...storedModelOutputs.slice(0, clonedElemIndex),
    storedModelOutputs[clonedElemIndex],
    ...storedModelOutputs.slice(clonedElemIndex, storedModelOutputs.length),
  ];

  yield put(updateStoredModelOutputsList(newModelOutputs));
  yield toast.success("Model output successfully cloned");
}

function* cloneModelOutputServerFailHandler() {
  yield toast.error("Error while cloning model output");
}

function* deleteModelOutputServerSuccessHandler(action: any) {
  const simulationName = action.meta.previousAction.payload?.simulationName;

  yield put(fetchModelOutputsListServer({ "simulation-name": simulationName }));
  toast.success("Model output successfully deleted");
}

function* deleteModelOutputServerFailHandler() {
  yield toast.error("Error while deleting model output");
}

export default modelOutputsSaga;
