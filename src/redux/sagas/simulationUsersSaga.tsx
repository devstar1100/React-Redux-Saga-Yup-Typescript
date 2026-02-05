import { put, select, takeEvery } from "redux-saga/effects";

import {
  ADD_SIMULATION_USER_SERVER,
  DELETE_SIMULATION_USER_SERVER,
  EDIT_SIMULATION_USER_SERVER,
  GET_SIMULATION_USERS_SERVER,
  updateAreSimulationUsersLoading,
  updateSimulationUserValidationErrors,
  updateSimulationUsers,
} from "../actions/simulationUsersActions";
import { failActionType } from "../../lib/failActionType";
import { SimulationUser } from "../../types/simulationUser";
import { successActionType } from "../../lib/successActionType";
import { getSimulationUsers } from "../reducers/simulationUsersReducer";
import { toast } from "react-toastify";
import { ValidationError } from "../../types/validationError";

const simulationUsersSaga = [
  takeEvery(GET_SIMULATION_USERS_SERVER, getSimulationUsersHandler),
  takeEvery(successActionType(GET_SIMULATION_USERS_SERVER), getSimulationUsersSuccessHandler),
  takeEvery(failActionType(GET_SIMULATION_USERS_SERVER), getSimulationUsersFailHandler),

  takeEvery(successActionType(ADD_SIMULATION_USER_SERVER), addSimulationUserSuccessHandler),
  takeEvery(failActionType(ADD_SIMULATION_USER_SERVER), addEditSimulationUserFailHandler),

  takeEvery(successActionType(EDIT_SIMULATION_USER_SERVER), editSimulationUserSuccessHandler),
  takeEvery(failActionType(EDIT_SIMULATION_USER_SERVER), addEditSimulationUserFailHandler),

  takeEvery(successActionType(DELETE_SIMULATION_USER_SERVER), deleteSimulationUserSuccessHandler),
  takeEvery(failActionType(DELETE_SIMULATION_USER_SERVER), deleteSimulationUserFailHandler),
];

function* getSimulationUsersHandler() {
  yield put(updateAreSimulationUsersLoading(true));
}

function* getSimulationUsersSuccessHandler(action: any) {
  const response = action.payload.data as SimulationUser[];

  yield put(updateSimulationUsers(response));
  yield put(updateAreSimulationUsersLoading(false));
}

function* getSimulationUsersFailHandler() {
  yield put(updateAreSimulationUsersLoading(false));
}

function* addSimulationUserSuccessHandler(action: any) {
  const response = action.payload.data as SimulationUser;
  const usersList = getSimulationUsers(yield select());

  const nextUsersList = [...usersList, response];

  yield put(updateSimulationUserValidationErrors([]));
  yield put(updateSimulationUsers(nextUsersList));
  toast.success(`User ${response["full-name"]} was successfully added`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* addEditSimulationUserFailHandler(action: any) {
  const response = action.error.response.data["validation-errors"] as ValidationError[];
  yield put(updateSimulationUserValidationErrors(response));
}

function* editSimulationUserSuccessHandler(action: any) {
  const response = action.payload.data as SimulationUser;
  const usersList = getSimulationUsers(yield select());

  const nextUsersList = usersList.map((item) =>
    item["user-id"] === response["user-id"] ? { ...item, ...response } : item,
  );

  yield put(updateSimulationUserValidationErrors([]));
  yield put(updateSimulationUsers(nextUsersList));
  toast.success(`User ${response["full-name"]} was successfully updated`);

  const redirect = action.meta.previousAction.payload.redirect;
  redirect?.();
}

function* deleteSimulationUserSuccessHandler(action: any) {
  const response = action.payload.data as SimulationUser;
  const usersList = getSimulationUsers(yield select());

  const nextUsersList = usersList.filter((item) => item["user-id"].toString() !== response["user-id"].toString());
  toast.success(`Simulation user was successfully deleted`);

  yield put(updateSimulationUsers(nextUsersList));
}

function* deleteSimulationUserFailHandler() {
  // whatever;
}

export default simulationUsersSaga;
