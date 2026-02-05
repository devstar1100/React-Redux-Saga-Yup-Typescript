import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import customViewSaga from "./customViewSaga";
import simulationSaga from "./simulationSaga";
import simulationsSaga from "./simulationsSaga";
import customViewsSaga from "./customViewsSaga";
import configurationFilesSaga from "./configurationFilesSaga";
import simulationUsersSaga from "./simulationUsersSaga";
import serverNodesSaga from "./serverNodesSaga";
import scenarioFilesSaga from "./scenarioFilesSaga";
import scenarioActionsSaga from "./scenarioActionsSaga";
import modelInputsSaga from "./modelInputsSaga";
import { simulatedModelsSaga } from "./simulatedModelsSaga";
import simulatedSystemsSaga from "./simulatedSystemsSaga";
import modelOutputsSaga from "./modelOutputsSaga";
import monteCarloBatchesSaga from "./monteCarloBatchesSaga";

function* rootSaga() {
  yield all([
    ...authSaga,
    ...simulationsSaga,
    ...simulationSaga,
    ...customViewSaga,
    ...customViewsSaga,
    ...configurationFilesSaga,
    ...simulationUsersSaga,
    ...serverNodesSaga,
    ...scenarioFilesSaga,
    ...scenarioActionsSaga,
    ...modelInputsSaga,
    ...simulatedModelsSaga,
    ...simulatedSystemsSaga,
    ...modelOutputsSaga,
    ...monteCarloBatchesSaga,
  ]);
}

export default rootSaga;
