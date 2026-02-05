import { put, select, takeEvery } from "redux-saga/effects";
import { failActionType } from "../../lib/failActionType";

import { successActionType } from "../../lib/successActionType";
import { UserData } from "../../types/auth";
import { LOG_IN_SERVER, LOG_OUT_SERVER, updateAuthData } from "../actions/authActions";
import { authInitialState, getUserData } from "../reducers/authReducer";

const authSaga = [
  takeEvery(LOG_IN_SERVER, logInHandler),
  takeEvery(successActionType(LOG_IN_SERVER), logInSuccessHandler),
  takeEvery(failActionType(LOG_IN_SERVER), logInFailHandler),

  takeEvery(LOG_OUT_SERVER, logOutSuccessHandler),
];

function* logInHandler() {
  const prevState = getUserData(yield select());

  yield put(updateAuthData({ ...prevState, isLoading: true }));
}

function* logInSuccessHandler(action: any) {
  const response = action.payload.data as UserData;

  yield put(updateAuthData({ ...response, isAuthorized: true, isLoading: false }));
}

function* logInFailHandler() {
  const prevState = getUserData(yield select());

  yield put(updateAuthData({ ...prevState, isLoading: false }));
}

function* logOutSuccessHandler() {
  yield put(updateAuthData({ ...authInitialState }));
}

export default authSaga;
