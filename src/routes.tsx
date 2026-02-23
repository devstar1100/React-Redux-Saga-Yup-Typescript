import { Routes, Route } from "react-router-dom";
import { pages } from "./lib/routeUtils";
import SimulationDashboard from "./modules/SimulationDashboard";
import CustomView from "./modules/CustomView";
import SimulationDataBrowser from "./modules/SimulationDataBrowser";
import MainLayout from "./layouts/MainLayout";
import SimulationsList from "./modules/SimulationsList";
import LoginPage from "./modules/Login";
import PrivateRoute from "./components/PrivateRoute";
import NotAuthorizedOnlyRoute from "./components/PrivateRoute/NotAuthorizedOnlyRoute";
import CustomViewsList from "./modules/CustomViewsList";
import AddEditCustomView from "./modules/AddEditCustomView";
import AllPopups from "./components/Popups/AllPopups";
import ConfigurationFilesList from "./modules/ConfigurationView";
import AddConfigurationFile from "./modules/AddConfigurationFile";
import SimulationUsers from "./modules/SimulationUsersList";
import ServerNodesList from "./modules/ServerNodesList";
import AddEditServerNode from "./modules/AddEditServerNode";
import AddEditSimulationUser from "./modules/AddEditSimulationUser";
import AddEditSimulation from "./modules/AddEditSimulation";
import SimulationCatalogue from "./modules/SimulationCatalogue";
import NotFoundPage from "./modules/NotFoundPage";
import ScenarioFilesList from "./modules/ScenarioFilesList";
import AddEditScenarioFilePage from "./modules/AddEditScenarioFilePage";
import ScenarioActionsList from "./modules/ScenarioActionsList";
import AddEditScenarioActionPage from "./modules/AddEditScenarioAction";
import GenerateSimulationCode from "./modules/GenerateSimulationCode";
import ModelInputsList from "./modules/ModelInputsList";
import SimulatedModelsList from "./modules/SimulatedModelsList";
import AddEditSimulatedModel from "./modules/AddEditSimulatedModel";
import SimulatedSystemsList from "./modules/SimulatedSystemsList";
import ModelOutputsList from "./modules/ModelOutputsList";
import AddEditSimulatedSystems from "./modules/AddEditSimulatedSystems";
import AddEditModelOutput from "./modules/AddEditModelOutput";
import AddEditModelInput from "./modules/AddEditModelInput";
import MonteCarloBach from "./modules/MonteCarloBach";
import AddEditMonteCarloBatch from "./modules/AddEditMonteCarloBatch";
import MonteCarloBatchesList from "./modules/MonteCarloBatchesList";
import MonteCarloBatchDashboard from "./modules/MonteCarloBatchDashboard";
import MonteCarloFilesList from "./modules/MonteCarloFilesList";
import AddEditMonteCarloFile from "./modules/AddEditMonteCarloFile";
import MonteCarloRecordsList from "./modules/MonteCarloRecordsList";
import AddEditMonteCarloRecord from "./modules/AddEditMonteCarloRecord";

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
            path={`${pages.editMonteCarloFile()}/:simulationId/:filename`}
            element={<AddEditMonteCarloFile isEditMode />}
          />
          <Route path={pages.createMonteCarloFile()} element={<AddEditMonteCarloFile />} />

          <Route path={`${pages.monteCarloRecords()}/:simulationId/:filename`} element={<MonteCarloRecordsList />} />
          <Route
            path={`${pages.editMonteCarloRecord()}/:simulationId/:filename/:description`}
            element={<AddEditMonteCarloRecord isEditMode />}
          />
          <Route
            path={`${pages.addMonteCarloRecord()}/:simulationId/:filename`}
            element={<AddEditMonteCarloRecord />}
          />

          <Route
            path={`${pages.modifyConfigurationFile()}/:fileId`}
            element={<AddConfigurationFile pageMode={"edit"} />}
          />
          <Route path={`${pages.modifyConfigurationFile()}`} element={<AddConfigurationFile pageMode={"edit"} />} />
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
