import { combineReducers } from "redux";
import appReducer from "./appReducer";
import authReducer from "./authReducer";
import customViewReducer from "./customViewReducer";
import simulationReducer from "./simulationReducer";
import simulationsReducer from "./simulationsReducer";
import popupsReducer from "./popupsReducer";
import customViewsReducer from "./customViewsReducer";
import configurationFilesReducer from "./configurationFilesReducer";
import simulationUsersReducer from "./simulationUsersReducer";
import serverNodesReducer from "./serverNodesReducer";
import scenarioFilesReducer from "./scenarioFilesReducer";
import scenarioListActionsReducer from "./scenarioActionsReducer";
import modelInputsReducer from "./modelInputsReducer";
import simulatedModelsReducer from "./simulatedModelsReducer";
import simulatedSystemsReducer from "./simulatedSystemsReducer";
import modelOutputsReducer from "./modelOutputsReducer";
import selectedSimulationReducer from "./selectedSimulationReducer";
import monteCarloBatchesReducer from "./monteCarloBatchesReducer";
import monteCarloFilesReducer from "./monteCarloFilesReducer";
import monteCarloRecordsReducer from "./monteCarloRecordsReducer";

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  simulations: simulationsReducer,
  simulation: simulationReducer,
  customView: customViewReducer,
  customViews: customViewsReducer,
  popups: popupsReducer,
  configurationFiles: configurationFilesReducer,
  simulationUsers: simulationUsersReducer,
  serverNodes: serverNodesReducer,
  scenarioFiles: scenarioFilesReducer,
  scenarioListActions: scenarioListActionsReducer,
  modelInputs: modelInputsReducer,
  simulatedModels: simulatedModelsReducer,
  simulatedSystems: simulatedSystemsReducer,
  modelOutputs: modelOutputsReducer,
  selectedSimulation: selectedSimulationReducer,
  monteCarloBatches: monteCarloBatchesReducer,
  monteCarloFiles: monteCarloFilesReducer,
  monteCarloRecords: monteCarloRecordsReducer,
});

export default rootReducer;
