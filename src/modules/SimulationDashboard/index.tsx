import SimulationControl from "../../components/SimulationControls";
import { useSelector } from "react-redux";
import { Grid, styled } from "@mui/material";
import LogStatistics from "../../components/LogStatisticsWidget";
import TimeInformation from "../../components/TimeInfoWidget";
import SessionInformation from "../../components/SessionInfoWidget";
import {
  getCurrentSimulation,
  getLogRecords,
  getSessionInformation,
  getSimulationLoadingStates,
  getTimeInformation,
} from "../../redux/reducers/simulationReducer";
import { LogRecordsData } from "../../types/simulations";
import Console from "../../components/ConsoleWidget";
import Seo from "../../components/Seo";
import withSimulation from "../../hocs/withSimulation";
import PageLoader from "../../components/PageLoader";

const SimulationDashboard = () => {
  const simulationData = useSelector(getCurrentSimulation);
  const timeInformation = useSelector(getTimeInformation);
  const sessionInformation = useSelector(getSessionInformation);
  const logRecords = useSelector(getLogRecords);
  const { isSimulationDataLoading } = useSelector(getSimulationLoadingStates) || {};

  const displaySessionInfo = sessionInformation || simulationData?.["default-session-information"];

  const formatStatistics = (data?: LogRecordsData) =>
    ({
      "total-number-of-log-records": data?.["total-number-of-log-records"] || 0,
      "total-number-of-warnings": data?.["total-number-of-warnings"] || 0,
      "total-number-of-errors": data?.["total-number-of-errors"] || 0,
      "total-number-of-fatals": data?.["total-number-of-fatals"] || 0,
    } as Omit<LogRecordsData, "log-records">);

  return (
    <>
      <Seo title="Dashboard" />
      {isSimulationDataLoading ? (
        <PageLoader />
      ) : (
        <>
          {simulationData && displaySessionInfo && (
            <>
              <SimulationControl
                simulationId={simulationData["simulation-id"]}
                speed={displaySessionInfo["simulation-execution-speed"]}
                runMode={displaySessionInfo["simulation-run-mode"]}
                sessionId={displaySessionInfo["simulation-session-id"]}
                sessionStatus={displaySessionInfo["simulation-session-status"]}
              />
              <Wrapper height="fit-content" container gap={{ sm: "10px", lg: "16px" }}>
                <Grid height="fit-content" container gap={{ sm: "10px", lg: "16px" }}>
                  <TimeInformation data={timeInformation || simulationData["default-time-information"]} />
                  <LogStatistics data={formatStatistics(logRecords)} />
                </Grid>
                <SessionInformation
                  data={displaySessionInfo}
                  overrideFileName={simulationData["initial-conditions-overide-name"]}
                />
              </Wrapper>
            </>
          )}
          <Console logs={logRecords?.["log-records"]} />
        </>
      )}
    </>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  flexWrap: "nowrap",
  [theme.breakpoints.down(1201)]: {
    flexWrap: "wrap",
  },
}));

export default withSimulation(SimulationDashboard, Number(process.env.REACT_APP_WIDGETS_REFRESH_INTERVAL_MS) || 1000);
