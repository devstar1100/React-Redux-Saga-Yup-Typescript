import { Grid, styled } from "@mui/material";
import SideBarSimulationIcon from "../Icons/SideBarSimulationIcon";
import SideBarManageIcon from "../Icons/SideBarManageIcon";
import SideBarConfigureIcon from "../Icons/SideBarConfigureIcon";
import SideBarDevelopSimulation from "../Icons/SideBarDevelopSimulation";
import SideBarAnalyseIcon from "../Icons/SideBarAnalyseIcon";
import HorizontalGrayLine from "../Lines/HorizontalGrayLine";
import { pages } from "../../lib/routeUtils";
import { FC, ReactElement } from "react";
import { GridProps } from "@mui/material/Grid/Grid";
import { preventForwardProps } from "../../lib/preventForwardProps";
import { getCurrentSimulation, getSessionInformation } from "../../redux/reducers/simulationReducer";
import { useSelector } from "react-redux";
import { CustomViewType } from "../../types/customViews";
import { useLocation, useParams } from "react-router-dom";
import { getCurrentRoute } from "../../lib/getCurrentRoute";
import { getSimulationCustomViews } from "../../redux/reducers/customViewsReducer";
import CollapseItem from "./CollapseItem";
import LogoutWrapper from "./LogoutWrapper";
import { getSimDependantPageFullLink } from "../../lib/simulationConfigurationUtils";

interface Props {
  openSideBar: boolean;
  handleToggleSideBar: () => void;
}

const Sidebar: FC<Props> = ({ openSideBar, handleToggleSideBar }): ReactElement => {
  const customViews = useSelector(getSimulationCustomViews);
  const simulation = useSelector(getCurrentSimulation);
  const session = useSelector(getSessionInformation);
  const { pathname } = useLocation();

  const currentRoute = getCurrentRoute(pathname) || "";
  const { simulationName } = useParams();
  const currentSimulationName = simulationName || "unknown";

  const simulationId = simulation?.["simulation-id"];
  const sessionId = session?.["simulation-session-id"];

  return (
    <Wrapper
      justifyContent="space-between"
      height="100%"
      maxWidth="fit-content"
      container
      gap="8px"
      direction="column"
      openSideBar={openSideBar}
    >
      <ItemWrapper className="itemWrapper">
        {getSidebarElements({ simulationId, sessionId, customViews, currentRoute, currentSimulationName }).map(
          (item) => (
            <CollapseItem handleToggleSideBar={handleToggleSideBar} openSideBar={openSideBar} key={item.id} {...item} />
          ),
        )}
      </ItemWrapper>
      <Grid pt="auto">
        <HorizontalGrayLine />
        <LogoutWrapper openSideBar={openSideBar} />
      </Grid>
    </Wrapper>
  );
};

const ItemWrapper = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "12px",
  width: "100%",
  [theme.breakpoints.down("xl")]: {
    width: "fit-content",
  },
  [theme.breakpoints.down("lg")]: {
    padding: "8px",
  },
}));

const Wrapper = styled<FC<GridProps & { openSideBar?: boolean }>>(
  Grid,
  preventForwardProps(["openSideBar"]),
)(({ theme, openSideBar }) => ({
  backgroundColor: theme.palette.additional[800],
  height: "calc(100vh - 72px)",
  overflow: "auto",
  position: "sticky",
  top: "72px",
  transformOrigin: "0 0 0 1",
  borderRight: `1px solid ${theme.palette.additional[700]}`,
  boxShadow: theme.palette.boxShadow.main,
  maxWidth: openSideBar ? "350px" : "fit-content",
  "& .sideBarItemTitle:first-of-type": {
    border: "none",
  },
  "& .horizontalGrayLine": {
    display: openSideBar ? "flex" : "none",
  },
  [theme.breakpoints.down("xl")]: {
    maxWidth: openSideBar ? "275px" : "fit-content",
  },
  [theme.breakpoints.down("lg")]: {
    maxWidth: openSideBar ? "235px" : "fit-content",
    height: "calc(100vh - 60px)",
    top: "60px",
  },
}));

const getSidebarElements = ({
  simulationId,
  sessionId,
  customViews,
  currentRoute,
  currentSimulationName,
}: GetSidebarElementsProps) => [
  {
    id: "manage-simulations",
    title: "Simulation Sessions",
    icon: <SideBarManageIcon />,
    link: pages.simulations(),
    isSelected: currentRoute === pages.simulations(),
  },
  {
    id: "simulation-control",
    title: "Simulation Control",
    icon: <SideBarSimulationIcon />,
    isDisabled: !simulationId || simulationId.toString() === "0",
    isSelected: [pages.simulationDashboard(), pages.simulationDataBrowser(), pages.customView()].includes(currentRoute),
    subItem: [
      {
        id: "simulation-dashboard",
        link: sessionId
          ? `${pages.simulationDashboard()}/${simulationId}/${sessionId}`
          : `${pages.simulationDashboard()}/${simulationId}`,
        title: "Dashboard",
      },
      {
        id: "simulation-data-browser",
        link: `${pages.simulationDataBrowser()}/${simulationId}/${sessionId}`,
        title: "Sim Data Browser",
        isDisabled: typeof sessionId !== "number",
      },
      ...(customViews || []).map((view) => ({
        id: `custom-view-${view["custom-view-id"]}`,
        link: `${pages.customView()}/${simulationId}/${sessionId}/${view["custom-view-id"]}`,
        title: `${view["custom-view-caption"]}`,
        isDisabled: typeof sessionId !== "number",
      })),
      {
        id: "disconnect",
        link: pages.main(),
        title: "Disconnect",
      },
    ],
  },
  {
    id: "configure",
    title: "Configure",
    icon: <SideBarConfigureIcon />,
    isSelected: [
      pages.customViewsList(),

      pages.serverNodes(),
      pages.createServerNode(),
      pages.editServerNode(),

      pages.configurationFiles(),
      pages.modifyConfigurationFile(),

      pages.simulationUsers(),
      pages.createSimulationUser(),
      pages.editSimulationUser(),

      pages.simulationCatalogue(),
      pages.createSimulation(),
      pages.editSimulation(),

      pages.monteCarloBatch(),
      pages.createMonteCarloBatch(),
      pages.editMonteCarloBatch(),

      pages.scenarioFiles(),
      pages.scenarioActions(),
      pages.createScenarioFile(),
      pages.editScenarioFile(),
      pages.createScenarioAction(),
      pages.editScenarioAction(),
    ].includes(currentRoute),
    subItem: [
      {
        id: "simulation-users",
        title: "Simulation users",
        link: "/simulation-users",
        isSelected: [pages.simulationUsers(), pages.editSimulationUser(), pages.createSimulationUser()].includes(
          currentRoute,
        ),
      },
      {
        id: "simulations-catalogue",
        title: "Simulations",
        link: "/simulation-catalogue",
        isSelected: [pages.simulationCatalogue(), pages.createSimulation(), pages.editSimulation()].includes(
          currentRoute,
        ),
      },
      {
        id: "monteCarlo-batch",
        title: "Monte Carlo Batches",
        link: "/monte-carlo-batches-config",
        isSelected: [pages.monteCarloBatch(), pages.createMonteCarloBatch(), pages.editMonteCarloBatch()].includes(
          currentRoute,
        ),
      },
      {
        id: "configuration-files",
        title: "Configuration files",
        link: pages.configurationFiles(),
        isSelected: [pages.configurationFiles(), pages.modifyConfigurationFile()].includes(currentRoute),
      },
      {
        id: "custom-views-list",
        title: "Custom views",
        link: `${pages.customViewsList()}`,
        isSelected: [pages.customViewsList()].includes(currentRoute),
      },
      {
        id: "server-nodes-list",
        title: "Server nodes",
        link: pages.serverNodes(),
        isSelected: [pages.createServerNode(), pages.serverNodes(), pages.editServerNode()].includes(currentRoute),
      },
      {
        id: "scenario-files",
        title: "Scenario files",
        link: getSimDependantPageFullLink({ baseRoute: pages.scenarioFiles(), simulationId, sessionId }),
        isSelected: [
          pages.scenarioFiles(),
          pages.scenarioActions(),
          pages.createScenarioFile(),
          pages.editScenarioFile(),
          pages.createScenarioAction(),
          pages.editScenarioAction(),
        ].includes(currentRoute),
      },
    ],
  },
  {
    id: "develop-simulations",
    title: "Develop Simulations",
    icon: <SideBarDevelopSimulation />,
    subItem: [
      {
        id: "simulated-systems",
        title: "Simulated Systems",
        link: pages.simulatedSystems(currentSimulationName),
      },
      {
        id: "simulated-models",
        title: "Simulated Models",
        link: pages.simulatedModelList(currentSimulationName),
      },
      {
        id: "model-outputs",
        title: "Model Outputs",
        link: pages.modelOutputsList(currentSimulationName),
      },
      {
        id: "model-inputs",
        title: "Model Inputs",
        link: pages.modelInputs(currentSimulationName),
      },
      {
        id: "code-generation",
        title: "Generate Simulation Code",
        link: pages.simulationCodeGeneration(),
      },
    ],
  },
  {
    id: "analyse",
    title: "Analyse",
    icon: <SideBarAnalyseIcon />,
    subItem: [
      {
        id: "recordings-analyzer",
        title: "Recordings analyzer",
        link: "/",
      },
      {
        id: "manage-plots",
        title: "Manage plots",
        link: "/",
      },
      {
        id: "run-plots",
        title: "Run plots",
        link: "/",
      },
      {
        id: "analyze-monte-carlo",
        title: "Analyze Monte Carlo",
        link: "/",
      },
      {
        id: "playback-recorder-data",
        title: "Playback recorded data",
        link: "/",
      },
      {
        id: "data-export",
        title: "Data export",
        link: "/",
      },
    ],
  },
];

interface GetSidebarElementsProps {
  simulationId?: number;
  sessionId?: number;
  customViews?: CustomViewType[];
  currentRoute: string;
  currentSimulationName: string;
}

export default Sidebar;
