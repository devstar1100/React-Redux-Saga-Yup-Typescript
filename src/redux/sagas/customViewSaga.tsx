import { toast } from "react-toastify";
import { put, select, takeEvery } from "redux-saga/effects";
import { failActionType } from "../../lib/failActionType";
import { successActionType } from "../../lib/successActionType";
import { updateCustomViewParamsValues } from "../../lib/updateCustomViewParamsValues";
import {
  CustomViewType,
  CustomViewBasicRefreshData,
  CustomViewDetailedRefreshData,
  DisplayElement,
} from "../../types/customViews";
import {
  DELETE_DISPLAY_ELEMENT,
  DUPLICATE_DISPLAY_ELEMENT,
  GET_CUSTOM_VIEW_DATA_SERVER,
  HANDLE_BUTTON_ACTION_SERVER,
  REFRESH_CUSTOM_VIEW_DATA_SERVER,
  UPDATE_CUSTOM_VIEW_LAYOUT_SERVER,
  updateCustomViewData,
  updateCustomViewLayoutServer,
  updateIsCustomViewLoading,
} from "../actions/customViewActions";
import { updateSimulationTimeInfo } from "../actions/simulationActions";
import { getCurrentCustomView } from "../reducers/customViewReducer";
import { getCurrentSimulation } from "../reducers/simulationReducer";
import { Simulation } from "../../types/simulations";

const customViewSaga = [
  takeEvery(GET_CUSTOM_VIEW_DATA_SERVER, getCustomViewDataHandler),
  takeEvery(successActionType(GET_CUSTOM_VIEW_DATA_SERVER), getCustomViewDataSuccessHandler),
  takeEvery(failActionType(GET_CUSTOM_VIEW_DATA_SERVER), getCustomViewDataFailHandler),

  takeEvery(successActionType(HANDLE_BUTTON_ACTION_SERVER), handleButtonActionSuccessHandler),
  takeEvery(successActionType(REFRESH_CUSTOM_VIEW_DATA_SERVER), refreshCustomViewDataSuccessHandler),

  takeEvery(successActionType(UPDATE_CUSTOM_VIEW_LAYOUT_SERVER), updateCustomViewLayoutSuccessHandler),
  takeEvery(failActionType(UPDATE_CUSTOM_VIEW_LAYOUT_SERVER), updateCustomViewLayoutFailHandler),

  takeEvery(DUPLICATE_DISPLAY_ELEMENT, duplicateDisplayElementActionHandler),
  takeEvery(DELETE_DISPLAY_ELEMENT, deleteDisplayElementActionHandler),
];

function* getCustomViewDataHandler() {
  yield put(updateIsCustomViewLoading(true));
}

function* getCustomViewDataSuccessHandler(action: any) {
  const response = action.payload.data[0] as CustomViewType;

  yield put(updateCustomViewData(response));
  yield put(updateIsCustomViewLoading(false));
}

function* getCustomViewDataFailHandler() {
  yield put(updateIsCustomViewLoading(false));
}

function* handleButtonActionSuccessHandler() {
  // yield toast.success("Action has been completed successfully!");
}

function* refreshCustomViewDataSuccessHandler(action: any) {
  const response = action.payload.data as CustomViewBasicRefreshData & CustomViewDetailedRefreshData;
  const customView = getCurrentCustomView(yield select());

  if (customView) {
    yield put(
      updateCustomViewData(
        updateCustomViewParamsValues(
          {
            "display-element-data-item-values": response["display-element-data-item-values"],
            "display-element-data-item-array-values": response["display-element-data-item-array-values"],
            "display-element-button-statuses": response["display-element-button-statuses"],
          },
          { ...customView, "refresh-interval-seconds": +response["refresh-interval-seconds"] } as CustomViewType,
        ),
      ),
    );
  }

  yield put(updateSimulationTimeInfo(response["simulation-time-information"]));
}

function* duplicateDisplayElementActionHandler(action: any) {
  const id = action.payload as number;
  const customView = getCurrentCustomView(yield select()) as CustomViewType;

  const elementsList: DisplayElement[] = customView["view-table-cells"].reduce(
    (acc, curr) => [...acc, ...curr["display-section-elements"]],
    [] as DisplayElement[],
  );
  const lastId = elementsList.reduce((acc, curr) => {
    if (curr["display-element-id"] > acc) return curr["display-element-id"];

    return acc;
  }, elementsList[0]["display-element-id"]);
  const element = elementsList.find((el) => el["display-element-id"] === id) as DisplayElement;
  const elementCopy: DisplayElement = {
    ...element,
    "display-element-caption": `${element["display-element-caption"]} - Copy`,
    "display-element-id": lastId + 1,
  };

  const nextData: CustomViewType = {
    ...customView,
    "view-table-cells": customView["view-table-cells"].map((column) => ({
      ...column,
      "display-section-elements": (() => {
        const insertionIdx: number = column["display-section-elements"].findIndex(
          (el) => el["display-element-id"] === id,
        );
        const colElements: DisplayElement[] = column["display-section-elements"];

        if (insertionIdx === -1) return colElements;

        const nextElements: DisplayElement[] = [
          ...colElements.slice(0, insertionIdx + 1),
          elementCopy,
          ...colElements.slice(insertionIdx + 1),
        ];

        return nextElements;
      })(),
    })),
  };

  yield put(updateCustomViewData(nextData));

  const simulation = getCurrentSimulation(yield select()) as Simulation;
  yield put(
    updateCustomViewLayoutServer({
      "simulation-id": simulation["simulation-id"],
      "custom-view-id": customView["custom-view-id"],
      nextData,
    }),
  );
}

function* deleteDisplayElementActionHandler(action: any) {
  const id = action.payload as number;
  const customView = getCurrentCustomView(yield select()) as CustomViewType;

  const nextData: CustomViewType = {
    ...customView,
    "view-table-cells": customView["view-table-cells"].map((column) => ({
      ...column,
      "display-section-elements": column["display-section-elements"].filter((el) => el["display-element-id"] !== id),
    })),
  };

  yield put(updateCustomViewData(nextData));

  const simulation = getCurrentSimulation(yield select()) as Simulation;
  yield put(
    updateCustomViewLayoutServer({
      "simulation-id": simulation["simulation-id"],
      "custom-view-id": customView["custom-view-id"],
      nextData,
    }),
  );
}

function* updateCustomViewLayoutSuccessHandler() {
  yield toast.success("Saved successfully!");
}

function* updateCustomViewLayoutFailHandler() {
  yield toast.error("Failed to save, please reload the page or try again later");
}

export default customViewSaga;
