import { put, select, takeEvery } from "redux-saga/effects";
import { toast } from "react-toastify";

import { ServerNode } from "../../types/serverNode";
import { failActionType } from "../../lib/failActionType";
import { successActionType } from "../../lib/successActionType";
import {
  ADD_SERVER_NODE_SERVER,
  DELETE_SERVER_NODE_SERVER,
  DUPLICATE_SERVER_NODE_SERVER,
  EDIT_SERVER_NODE_SERVER,
  GET_SERVER_NODES_SERVER,
  getServerNodesServer,
  updateAreServerNodesLoading,
  updateServerNodeValidationErrors,
  updateServerNodes,
} from "../actions/serverNodesActions";
import { getServerNodes } from "../reducers/serverNodesReducer";
import { ValidationError } from "../../types/validationError";

const serverNodesSaga = [
  takeEvery(GET_SERVER_NODES_SERVER, getServerNodesHandler),
  takeEvery(successActionType(GET_SERVER_NODES_SERVER), getServerNodesSuccessHandler),
  takeEvery(failActionType(GET_SERVER_NODES_SERVER), getServerNodesFailHandler),

  takeEvery(successActionType(ADD_SERVER_NODE_SERVER), addServerNodeSuccessHandler),
  takeEvery(failActionType(ADD_SERVER_NODE_SERVER), addEditServerNodeFailHandler),

  takeEvery(successActionType(EDIT_SERVER_NODE_SERVER), editServerNodeSuccessHandler),
  takeEvery(failActionType(EDIT_SERVER_NODE_SERVER), addEditServerNodeFailHandler),

  takeEvery(successActionType(DELETE_SERVER_NODE_SERVER), deleteServerNodeSuccessHandler),
  takeEvery(failActionType(DELETE_SERVER_NODE_SERVER), deleteServerNodeFailHandler),

  takeEvery(successActionType(DUPLICATE_SERVER_NODE_SERVER), duplicateServerNodeSuccessHandler),
  takeEvery(failActionType(DUPLICATE_SERVER_NODE_SERVER), duplicateServerNodeFailHandler),
];

function* getServerNodesHandler() {
  yield put(updateAreServerNodesLoading(true));
}

function* getServerNodesSuccessHandler(action: any) {
  const response = action.payload.data as ServerNode[];

  yield put(updateServerNodes(response));
  yield put(updateAreServerNodesLoading(false));
}

function* getServerNodesFailHandler() {
  yield put(updateAreServerNodesLoading(false));
}

function* addServerNodeSuccessHandler(action: any) {
  const response = action.payload.data as ServerNode;
  const nodesList = getServerNodes(yield select());

  const nextNodesList = [...nodesList, response];

  yield put(updateServerNodes(nextNodesList));
  yield put(updateServerNodeValidationErrors([]));
  toast.success(`Simulation server node for simulation ${response["simulation-name"]} was successfully added`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addEditServerNodeFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];
  yield put(updateServerNodeValidationErrors(response));
}

function* editServerNodeSuccessHandler(action: any) {
  const response = action.payload.data as ServerNode;
  const nodesList = getServerNodes(yield select());

  const nextNodesList = nodesList.map((item) =>
    item["simulation-server-node-id"] === response["simulation-server-node-id"] ? { ...item, ...response } : item,
  );

  yield put(updateServerNodes(nextNodesList));
  yield put(updateServerNodeValidationErrors([]));
  toast.success(`Simulation server node for simulation ${response["simulation-name"]} was successfully updated`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* deleteServerNodeSuccessHandler(action: any) {
  const response = action.payload.data as ServerNode;
  const nodesList = getServerNodes(yield select());

  const nextNodesList = nodesList.filter(
    (item) => item["simulation-server-node-id"].toString() !== response["simulation-server-node-id"].toString(),
  );
  toast.success(`Simulation server node was successfully deleted`);

  yield put(updateServerNodes(nextNodesList));
}

function* deleteServerNodeFailHandler() {
  yield toast.error("Error while deleting server node");
}

function* duplicateServerNodeSuccessHandler(action: any) {
  toast.success("Server node was successfully duplicated");

  yield put(getServerNodesServer({}));
}

function* duplicateServerNodeFailHandler() {
  yield toast.error("Error while duplicating server node");
}

export default serverNodesSaga;
