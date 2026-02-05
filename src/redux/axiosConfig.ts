import { toast } from "react-toastify";

import { Error } from "./types/error.types";
import { authInitialState } from "./reducers/authReducer";
import { updateAuthData } from "./actions/authActions";

const sessionExpiredToastId = "session-expired" as const;
const randomErrorToastId = "error-occurred" as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
const options = {
  interceptors: {
    request: [
      ({ getState }: any, config: any) => {
        const store = getState();
        const token = store?.auth?.["access-token"];
        if (token) {
          config.headers["access-token"] = token;
        }
        return config;
      },
    ],
    response: [
      {
        success: function (_props: any, response: any) {
          return response;
        },
        error: function ({ dispatch }: any, errorSource: any) {
          if (errorSource?.response?.status === 401) {
            dispatch(updateAuthData(authInitialState));

            if (!toast.isActive(sessionExpiredToastId))
              toast.warn("Session expired! Please re-login.", { toastId: sessionExpiredToastId });

            return;
          }

          const validationError = errorSource?.response?.data?.["validation-errors"]?.length > 0;
          const error = errorSource?.response?.data as Error;

          if (!toast.isActive(randomErrorToastId) && !validationError)
            toast.error(error?.["error-message"] || "The API server is not available!", {
              toastId: error?.["error-message"] || randomErrorToastId,
            });

          return Promise.reject(errorSource);
        },
      },
    ],
  },
};

export default options;
