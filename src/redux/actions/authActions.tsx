import { authStateType } from "../reducers/authReducer";

export const LOG_IN_SERVER = "LOG_IN_SERVER";
export const LOG_OUT_SERVER = "LOG_OUT_SERVER";

export const UPDATE_AUTH_DATA = "UPDATE_AUTH_DATA";

interface LogInServerProps {
  "user-name": string;
  password: string;
}

export const logInServer = (props: LogInServerProps) => ({
  type: LOG_IN_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/authenticate`,
      params: { "user-name": props["user-name"], password: props.password },
    },
  },
});

export const logOutServer = () => ({
  type: LOG_OUT_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/logout`,
    },
  },
});

export const updateAuthData = (nextData: authStateType) => ({
  type: UPDATE_AUTH_DATA,
  payload: nextData,
});
