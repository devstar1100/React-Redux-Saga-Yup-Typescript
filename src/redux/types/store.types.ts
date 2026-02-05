import { appStateType } from "../reducers/appReducer";
import { authStateType } from "../reducers/authReducer";
import { configurationFilesStateType } from "../reducers/configurationFilesReducer";
import { customViewStateType } from "../reducers/customViewReducer";
import { customViewsStateType } from "../reducers/customViewsReducer";
import { PopupsStateType } from "../reducers/popupsReducer";
import { scenarioFilesStateType } from "../reducers/scenarioFilesReducer";
import { scenarioListActionsStateType } from "../reducers/scenarioActionsReducer";
import { serverNodesStateType } from "../reducers/serverNodesReducer";
import { simulationStateType } from "../reducers/simulationReducer";
import { simulationUsersStateType } from "../reducers/simulationUsersReducer";
import { simulationsStateType } from "../reducers/simulationsReducer";
import { modelInputsStateType } from "../reducers/modelInputsReducer";
import { simulatedModelsStateType } from "../reducers/simulatedModelsReducer";
import { simulatedSystemsStateType } from "../reducers/simulatedSystemsReducer";
import { modelOutputsStateType } from "../reducers/modelOutputsReducer";
import { selectedSimulationStateType } from "../reducers/selectedSimulationReducer";
import { monteCarloBatchesStateType } from "../reducers/monteCarloBatchesReducer";

export interface StoreType {
  app: appStateType;
  simulations: simulationsStateType;
  simulation: simulationStateType;
  auth: authStateType;
  customView: customViewStateType;
  customViews: customViewsStateType;
  popups: PopupsStateType;
  configurationFiles: configurationFilesStateType;
  simulationUsers: simulationUsersStateType;
  serverNodes: serverNodesStateType;
  scenarioFiles: scenarioFilesStateType;
  scenarioListActions: scenarioListActionsStateType;
  modelInputs: modelInputsStateType;
  simulatedModels: simulatedModelsStateType;
  simulatedSystems: simulatedSystemsStateType;
  modelOutputs: modelOutputsStateType;
  selectedSimulation: selectedSimulationStateType;
  monteCarloBatches: monteCarloBatchesStateType;
}
