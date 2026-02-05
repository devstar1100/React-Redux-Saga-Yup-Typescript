import { put, takeEvery } from "redux-saga/effects";
import { successActionType } from "../../lib/successActionType";
import {
  ADD_SIMULATED_MODEL,
  DELETE_SIMULATED_MODEL,
  DUPLICATE_SIMULATED_MODEL,
  EDIT_SIMULATED_MODEL,
  GET_SIMULATED_MODELS,
  updateSimulatedModelAlertData,
  updateSimulatedModelErrors,
  updateSimulatedModels,
  updateSimulatedModelsLoading,
} from "../actions/simulatedModelsActions";
import { SimulatedModel } from "../../types/SimulatedModel";
import { failActionType } from "../../lib/failActionType";
import { ValidationError } from "../../types/validationError";
import { toast } from "react-toastify";

export const simulatedModelsSaga = [
  takeEvery(GET_SIMULATED_MODELS, getSimulatedModelsHandler),
  takeEvery(successActionType(GET_SIMULATED_MODELS), getSimulatedModelsSuccessHandler),
  takeEvery(failActionType(GET_SIMULATED_MODELS), getSimulatedModelsFailHandler),

  takeEvery(successActionType(ADD_SIMULATED_MODEL), addSimulatedModelSuccessHandler),
  takeEvery(failActionType(ADD_SIMULATED_MODEL), addSimulatedModelFailHandler),

  takeEvery(successActionType(EDIT_SIMULATED_MODEL), editSimulatedModelSuccessHandler),
  takeEvery(failActionType(EDIT_SIMULATED_MODEL), editSimulatedModelFailHandler),

  takeEvery(successActionType(DUPLICATE_SIMULATED_MODEL), duplicateSimulatedModelSuccessHandler),
  takeEvery(failActionType(DUPLICATE_SIMULATED_MODEL), duplicateSimulatedModelFailHandler),

  takeEvery(successActionType(DELETE_SIMULATED_MODEL), deleteSimulatedModelSuccessHandler),
  takeEvery(failActionType(DELETE_SIMULATED_MODEL), deleteSimulatedModelFailHandler),
];

function* getSimulatedModelsHandler() {
  yield put(updateSimulatedModelsLoading(true));
}

function* getSimulatedModelsSuccessHandler(action: any) {
  const response = action.payload.data as SimulatedModel[];

  yield put(updateSimulatedModels(response));
  yield put(updateSimulatedModelsLoading(false));
}

function* getSimulatedModelsFailHandler() {
  yield put(updateSimulatedModelsLoading(false));
}

function* addSimulatedModelSuccessHandler(action: any) {
  const redirect = action.meta.previousAction.payload.redirect;
  const className = action.meta.previousAction.payload["class-name"];

  redirect();
  yield put(
    updateSimulatedModelAlertData({
      isVisible: true,
      text: `Simulated model ${className} was successfully added`,
    }),
  );
}

function* addSimulatedModelFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  toast.error("Error while adding simulated model");
  yield put(updateSimulatedModelErrors(response));
}

function* editSimulatedModelSuccessHandler(action: any) {
  const redirect = action.meta.previousAction.payload.redirect;
  const className = action.meta.previousAction.payload["class-name"];

  yield put(
    updateSimulatedModelAlertData({
      isVisible: true,
      text: `Simulated model ${className} was successfully updated`,
    }),
  );
  redirect();
}

function* editSimulatedModelFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];

  toast.error("Error while updating simulated model");
  yield put(updateSimulatedModelErrors(response));
}

function* duplicateSimulatedModelSuccessHandler(action: any) {
  const refetch = action.meta.previousAction.payload.refetch;
  toast.success("Simulated model was successfully duplicated");

  yield refetch();
}

function* duplicateSimulatedModelFailHandler() {
  yield toast.error("Error while duplicating simulated model");
}

function* deleteSimulatedModelSuccessHandler(action: any) {
  const refetch = action.meta.previousAction.payload.refetch;

  toast.success("Simulated model was successfully deleted");
  yield refetch();
}

function* deleteSimulatedModelFailHandler() {
  yield toast.success("Error while deleting simulated model");
}
