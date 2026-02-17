import { Breadcrumbs as MUIBreadcrumbs, styled } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ReactElement } from "react";
import { useSelector } from "react-redux";

import { pages } from "../../lib/routeUtils";
import { getCurrentSimulation, getSessionInformation } from "../../redux/reducers/simulationReducer";
import BreadcrumbsContent from "./BreadcrumbsContent";
import { getCurrentCustomView } from "../../redux/reducers/customViewReducer";
import { getCurrentRoute } from "../../lib/getCurrentRoute";
import { getConfigurationFiles } from "../../redux/reducers/configurationFilesReducer";

const BreadcrumbsWrapper = (): ReactElement => {
  const { pathname } = useLocation();
  const route = getCurrentRoute(pathname);

  const simulationDashboardData = useSelector(getCurrentSimulation);
  const simulationSessionData = useSelector(getSessionInformation);
  const customViewData = useSelector(getCurrentCustomView);
  const simulationUserConfigs = useSelector(getConfigurationFiles);

  const configName =
    simulationUserConfigs.find(
      (config) => config["simulation-user-config-id"] === simulationDashboardData?.["simulation-user-config-id"],
    )?.["configuration-name"] || "";
  const displaySessionInfo = simulationSessionData || simulationDashboardData?.["default-session-information"];

  const getSimulationNavLinks = (pageTitle: string) => [
    simulationDashboardData?.["simulation-name"] || "",
    displaySessionInfo
      ? simulationSessionData
        ? `[${configName}] Session #${displaySessionInfo?.["simulation-session-id"].toString() || ""}`
        : `[${configName}]`
      : "",
    pageTitle,
  ];

  const pagesNavText = {
    [pages.simulations()]: getSimulationNavLinks("Simulation Sessions"),
    [pages.simulationDashboard()]: getSimulationNavLinks("Simulation Dashboard"),
    [pages.simulationDataBrowser()]: getSimulationNavLinks("Simulation Data Browser"),

    [pages.serverNodes()]: ["Server Nodes"],
    [pages.editServerNode()]: ["Edit Server Node"],

    [pages.configurationFiles()]: ["Configuration Files"],
    [pages.modifyConfigurationFile()]: ["Edit Configuration File"],

    [pages.simulationUsers()]: ["Simulation Users"],
    [pages.editSimulationUser()]: ["Edit Simulation User"],

    [pages.simulationCatalogue()]: ["Simulations"],
    [pages.createSimulation()]: ["Create Simulation"],
    [pages.editSimulation()]: ["Edit Simulation"],

    [pages.monteCarloBatch()]: ["Monte Carlo Batches Config"],
    [pages.monteCarloBatchDashboard()]: ["Monte Carlo Batch Status"],
    [pages.monteCarloBatchesList()]: ["Monte Carlo Batches"],
    [pages.createMonteCarloBatch()]: ["Create Monte Carlo Batch"],
    [pages.editMonteCarloBatch()]: ["Edit Monte Carlo Batch"],

    [pages.monteCarloFiles()]: ["Monte Carlo Inputs And Outputs Files List"],

    [pages.customViewsList()]: ["Custom Views"],
    [pages.customView()]: getSimulationNavLinks(
      `/ ${customViewData?.["custom-view-caption"]}` || "/ <Custom view name>",
    ),
    [pages.createCustomView()]: ["Create Custom View"],
    [pages.editCustomView()]: ["Edit Custom View"],
  };

  if (!route) return <></>;

  return (
    <Breadcrumbs>
      <BreadcrumbsContent route={route} pagesNavText={pagesNavText} />
    </Breadcrumbs>
  );
};

const Breadcrumbs = styled(MUIBreadcrumbs)(({ theme }) => ({
  display: "flex",
  color: theme.palette.textColor.light,
  a: {
    display: "flex",
  },

  li: {
    columnGap: "5px",
    display: "flex",
  },
}));

export default BreadcrumbsWrapper;
