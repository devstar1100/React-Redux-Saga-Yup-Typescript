import { Routes, Route } from "react-router-dom";
import { pages } from "./lib/routeUtils";
import SimulationDashboard from "./modules/SimulationDashboard/SimulationDashboard";
import CustomView from "./modules/CustomView/CustomView";
import SimulationDataBrowser from "./modules/SimulationDataBrowser/SimulationDataBrowser";
import MainLayout from "./layouts/MainLayout";
import SimulationsList from "./modules/SimulationsList/SimulationsList";
import LoginPage from "./modules/Login/Login";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import NotAuthorizedOnlyRoute from "./components/PrivateRoute/NotAuthorizedOnlyRoute";
import CustomViewsList from "./modules/CustomViewsList/CustomViewsList";
import AddEditCustomView from "./modules/AddEditCustomView/AddEditCustomView";
import AllPopups from "./components/Popups/AllPopups";
import ConfigurationFilesList from "./modules/ConfigurationView/ConfigurationFilesList";
import AddConfigurationFile from "./modules/AddConfigurationFile/AddEditConfigurationFile";
import SimulationUsers from "./modules/SimulationUsersList/SimulationUsersList";
import ServerNodesList from "./modules/ServerNodesList/ServerNodesList";
import AddEditServerNode from "./modules/AddEditServerNode/AddEditServerNode";
import AddEditSimulationUser from "./modules/AddEditSimulationUser/AddEditSimulationUser";
import AddEditSimulation from "./modules/AddEditSimulation/AddEditSimulation";
import SimulationCatalogue from "./modules/SimulationCatalogue/SimulationCatalogue";
import NotFoundPage from "./modules/NotFoundPage/NotFoundPage";
import ScenarioFilesList from "./modules/ScenarioFilesList/ScenarioFilesList";
import AddEditScenarioFilePage from "./modules/AddEditScenarioFilePage/AddEditScenarioFilePage";
import ScenarioActionsList from "./modules/ScenarioActionsList/ScenarioActionsList";
import AddEditScenarioActionPage from "./modules/AddEditScenarioAction/AddEditScenarioAction";
import GenerateSimulationCode from "./modules/GenerateSimulationCode/GenerateSimulationCode";
import ModelInputsList from "./modules/ModelInputsList/ModelInputsList";
import SimulatedModelsList from "./modules/SimulatedModelsList/SimulatedModelsList";
import AddEditSimulatedModel from "./modules/AddEditSimulatedModel/AddEditSimulatedModel";
import SimulatedSystemsList from "./modules/SimulatedSystemsList/SimulatedSystemsList";
import ModelOutputsList from "./modules/ModelOutputsList/ModelOutputsList";
import AddEditSimulatedSystems from "./modules/AddEditSimulatedSystems/AddEditSimulatedSystems";
import AddEditModelOutput from "./modules/AddEditModelOutput/AddEditModelOutput";
import AddEditModelInput from "./modules/AddEditModelInput/AddEditModelInput";
import MonteCarloBach from "./modules/MonteCarloBach/MonteCarloBach";
import AddEditMonteCarloBatch from "./modules/AddEditMonteCarloBatch/AddEditMonteCarloBatch";
import MonteCarloBatchesList from "./modules/MonteCarloBatchesList/monteCarloBatchesList";
import MonteCarloBatchDashboard from "./modules/MonteCarloBatchDashboard";
import MonteCarloFilesList from "./modules/MonteCarloFilesList";

const Router = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path={pages.main()} element={<NotAuthorizedOnlyRoute />}>
          <Route path={pages.login()} element={<LoginPage />} />
          <Route path={pages.main()} element={<LoginPage />} />
        </Route>

        <Route path={pages.main()} element={<PrivateRoute />}>
          <Route path={`${pages.simulationDashboard()}/:simulationId`} element={<SimulationDashboard />} />
          <Route path={`${pages.monteCarloBatchDashboard()}/:batchId`} element={<MonteCarloBatchDashboard />} />
          <Route path={`${pages.simulationDashboard()}/:simulationId/:sessionId`} element={<SimulationDashboard />} />
          <Route
            path={`${pages.simulationDataBrowser()}/:simulationId/:sessionId`}
            element={<SimulationDataBrowser />}
          />
          <Route path={`${pages.customView()}/:simulationId/:sessionId/:customViewId`} element={<CustomView />} />
          <Route path={`${pages.simulatedModelList(":simulationName")}`} element={<SimulatedModelsList />} />
          <Route path={pages.simulations()} element={<SimulationsList />} />
          <Route path={pages.createSimulation()} element={<AddEditSimulation />} />
          <Route path={`${pages.editSimulation()}/:simulationId`} element={<AddEditSimulation isEditMode />} />
          <Route path={pages.configurationFiles()} element={<ConfigurationFilesList />} />
          <Route path={pages.monteCarloFiles()} element={<MonteCarloFilesList />} />
          <Route
            path={`${pages.modifyConfigurationFile()}/:fileId`}
            element={<AddConfigurationFile pageMode={"edit"} />}
          />
          <Route path={`${pages.modifyConfigurationFile()}`} element={<AddConfigurationFile pageMode={"create"} />} />
          <Route path={pages.simulationUsers()} element={<SimulationUsers />} />
          <Route path={pages.simulationCatalogue()} element={<SimulationCatalogue />} />

          <Route path={pages.monteCarloBatchesList()} element={<MonteCarloBatchesList />} />
          <Route path={pages.monteCarloBatch()} element={<MonteCarloBach />} />
          <Route path={pages.createMonteCarloBatch()} element={<AddEditMonteCarloBatch />} />
          <Route path={`${pages.editMonteCarloBatch()}/:batchId`} element={<AddEditMonteCarloBatch isEditMode />} />

          <Route path={pages.createSimulationUser()} element={<AddEditSimulationUser />} />
          <Route path={`${pages.editSimulationUser()}/:userId`} element={<AddEditSimulationUser isEditMode />} />
          <Route path={`${pages.customViewsList()}`} element={<CustomViewsList />} />
          <Route path={`${pages.createCustomView()}`} element={<AddEditCustomView />} />
          <Route
            path={`${pages.editCustomView()}/:simulationId/:customViewId`}
            element={<AddEditCustomView isEditMode />}
          />

          <Route path={`${pages.scenarioFiles()}`} element={<ScenarioFilesList />} />
          <Route path={`${pages.scenarioFiles()}/:simulationId`} element={<ScenarioFilesList />} />
          <Route path={`${pages.scenarioFiles()}/:simulationId/:sessionId`} element={<ScenarioFilesList />} />
          <Route path={`${pages.createScenarioFile()}`} element={<AddEditScenarioFilePage pageMode="create" />} />
          <Route
            path={`${pages.createScenarioFile()}/:simulationId`}
            element={<AddEditScenarioFilePage pageMode="create" />}
          />
          <Route
            path={`${pages.createScenarioFile()}/:simulationId/:sessionId`}
            element={<AddEditScenarioFilePage pageMode="create" />}
          />
          <Route path={`${pages.editScenarioFile()}/:fileId`} element={<AddEditScenarioFilePage pageMode="edit" />} />
          <Route
            path={`${pages.editScenarioFile()}/:simulationId/:fileId`}
            element={<AddEditScenarioFilePage pageMode="edit" />}
          />
          <Route
            path={`${pages.editScenarioFile()}/:simulationId/:sessionId/:fileId`}
            element={<AddEditScenarioFilePage pageMode="edit" />}
          />
          <Route path={`${pages.scenarioActions()}/:listId`} element={<ScenarioActionsList />} />
          <Route path={`${pages.scenarioActions()}/:simulationId/:listId`} element={<ScenarioActionsList />} />
          <Route
            path={`${pages.scenarioActions()}/:simulationId/:sessionId/:listId`}
            element={<ScenarioActionsList />}
          />
          <Route
            path={`${pages.createScenarioAction()}/:listId`}
            element={<AddEditScenarioActionPage pageMode="create" />}
          />
          <Route
            path={`${pages.createScenarioAction()}/:simulationId/:listId`}
            element={<AddEditScenarioActionPage pageMode="create" />}
          />
          <Route
            path={`${pages.createScenarioAction()}/:simulationId/:sessionId/:listId`}
            element={<AddEditScenarioActionPage pageMode="create" />}
          />
          <Route
            path={`${pages.editScenarioAction()}/:listId/:actionKey`}
            element={<AddEditScenarioActionPage pageMode="edit" />}
          />
          <Route
            path={`${pages.editScenarioAction()}/:simulationId/:listId/:actionKey`}
            element={<AddEditScenarioActionPage pageMode="edit" />}
          />
          <Route
            path={`${pages.editScenarioAction()}/:simulationId/:sessionId/:listId/:actionKey`}
            element={<AddEditScenarioActionPage pageMode="edit" />}
          />
          <Route path={pages.serverNodes()} element={<ServerNodesList />} />
          <Route path={pages.createServerNode()} element={<AddEditServerNode />} />
          <Route path={`${pages.editServerNode()}/:serverNodeId`} element={<AddEditServerNode isEditMode />} />
          <Route path={`${pages.simulationCodeGeneration()}`} element={<GenerateSimulationCode />} />
          <Route path={`${pages.modelInputs(":simulationName")}`} element={<ModelInputsList />} />
          <Route
            path={`${pages.editModelInputs()}/:simulationName/:modelInputId`}
            element={<AddEditModelInput isEditMode />}
          />
          <Route path={`${pages.addModelInputs()}/:simulationName`} element={<AddEditModelInput />} />
          <Route path={`${pages.simulatedSystems(":simulationName")}`} element={<SimulatedSystemsList />} />
          <Route path={`${pages.createSimulatedSystem()}/:simulationName`} element={<AddEditSimulatedSystems />} />
          <Route
            path={`${pages.editSimulatedSystem()}/:simulationName/:modelId`}
            element={<AddEditSimulatedSystems isEditMode />}
          />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route
            path={`${pages.editSimulatedModel()}/:simulationName/:simulatedModelId`}
            element={<AddEditSimulatedModel isEditMode />}
          />
          <Route path={`${pages.addSimulatedModel()}/:simulationName`} element={<AddEditSimulatedModel />} />
          <Route path={`${pages.modelOutputsList(":simulationName")}`} element={<ModelOutputsList />} />
          <Route path={`${pages.addModelOutput()}/:simulationName`} element={<AddEditModelOutput />} />
          <Route
            path={`${pages.editModelOutput()}/:simulationName/:modelOutputId`}
            element={<AddEditModelOutput isEditMode />}
          />
        </Route>
      </Routes>
      <AllPopups />
    </MainLayout>
  );
};

export default Router;
