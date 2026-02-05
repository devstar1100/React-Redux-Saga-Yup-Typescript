import { put, select, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";

import { successActionType } from "../../lib/successActionType";
import {
  CLONE_CUSTOM_VIEW_SERVER,
  DELETE_CUSTOM_VIEW_SERVER,
  ADD_CUSTOM_VIEW_SERVER,
  EDIT_CUSTOM_VIEW_SERVER,
  GET_SIMULATION_CUSTOM_VIEWS_SERVER,
  GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER,
  updateCustomViewGridTemplates,
  updateSimulationCustomViews,
  updateAreGridTemplatesLoading,
  GET_CUSTOM_VIEWS_LIST_SERVER,
  updateCustomViewsList,
  getCustomViewsListServer,
} from "../actions/customViewsActions";
import { CustomViewType, CustomViewGridTemplate } from "../../types/customViews";
import { getAllCustomViews, getSimulationCustomViews } from "../reducers/customViewsReducer";
import { failActionType } from "../../lib/failActionType";

const customViewsSaga = [
  takeEvery(successActionType(GET_SIMULATION_CUSTOM_VIEWS_SERVER), getCustomViewsSuccessHandler),

  takeEvery(successActionType(GET_CUSTOM_VIEWS_LIST_SERVER), getCustomViewsListSuccessHandler),

  takeEvery(GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER, getCustomViewGridTemplatesHandler),
  takeEvery(successActionType(GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER), getCustomViewGridTemplatesSuccessHandler),
  takeEvery(failActionType(GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER), getCustomViewGridTemplatesFailHandler),

  takeEvery(successActionType(CLONE_CUSTOM_VIEW_SERVER), cloneCustomViewSuccessHandler),
  takeEvery(failActionType(CLONE_CUSTOM_VIEW_SERVER), cloneCustomViewFailHandler),

  takeEvery(successActionType(DELETE_CUSTOM_VIEW_SERVER), deleteCustomViewSuccessHandler),
  takeEvery(failActionType(DELETE_CUSTOM_VIEW_SERVER), deleteCustomViewFailHandler),

  takeEvery(successActionType(ADD_CUSTOM_VIEW_SERVER), addCustomViewSuccessHandler),
  takeEvery(successActionType(EDIT_CUSTOM_VIEW_SERVER), editCustomViewSuccessHandler),
];

function* getCustomViewsSuccessHandler(action: any) {
  const response = action.payload.data as CustomViewType[];

  yield put(updateSimulationCustomViews(response));
}

function* getCustomViewsListSuccessHandler(action: any) {
  const response = action.payload.data as CustomViewType[];

  yield put(updateCustomViewsList(response));
}

function* getCustomViewGridTemplatesHandler() {
  yield put(updateAreGridTemplatesLoading(true));
}

function* getCustomViewGridTemplatesSuccessHandler(action: any) {
  const response = action.payload.data as CustomViewGridTemplate[];

  yield put(updateCustomViewGridTemplates(response));
  yield put(updateAreGridTemplatesLoading(false));
}

function* getCustomViewGridTemplatesFailHandler() {
  yield put(updateAreGridTemplatesLoading(false));
}

function* addCustomViewSuccessHandler(action: any) {
  yield toast.success("Custom view has been created successfully!");

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* editCustomViewSuccessHandler(action: any) {
  yield toast.success("Custom view has been updated successfully!");

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* cloneCustomViewSuccessHandler(action: any) {
  yield put(getCustomViewsListServer());
  toast.success("Custom view was successfully cloned");
}

function* cloneCustomViewFailHandler(action: any) {
  yield toast.error("Error while cloning custom view");
}

function* deleteCustomViewSuccessHandler(action: any) {
  const customViewId = action.meta.previousAction.payload.request.params["custom-view-id"];
  const simulationId = action.meta.previousAction.payload.request.params["simulation-id"];

  const currentCustomViews: CustomViewType[] = yield select(getAllCustomViews);

  const deletedIndex = currentCustomViews.findIndex(
    (view) => view["custom-view-id"] === customViewId && view["simulation-id"] === simulationId,
  );
  toast.success("File successfully deleted");

  const updatedCustomViews = [
    ...currentCustomViews.slice(0, deletedIndex),
    ...currentCustomViews.slice(deletedIndex + 1, currentCustomViews.length),
  ];

  yield put(updateCustomViewsList(updatedCustomViews));
}

function* deleteCustomViewFailHandler(action: any) {
  yield toast.error("Error while deleting custom view");
}

export default customViewsSaga;
