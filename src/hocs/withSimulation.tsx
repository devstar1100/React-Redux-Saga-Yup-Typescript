import { Grid, styled } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Navigation from "../components/Navigation/Navigation";
import Sidebar from "../components/Sidebar/Sidebar";

import {
  clearSimulationSession,
  fetchLogRecordsServer,
  getSimulationDataServer,
  queryTimeInformationServer,
  runSimulationSessionActionServer,
  updateLogRecords,
} from "../redux/actions/simulationActions";
import {
  getCurrentSimulation,
  getLogRecords,
  getSessionInformation,
  getTimeInformation,
  logRecordsClearState,
} from "../redux/reducers/simulationReducer";
import { LogRecordsData, SessionStatus, SimulationSessionActionType } from "../types/simulations";
import { getSimulationCustomViews } from "../redux/reducers/customViewsReducer";
import { getSimulationCustomViewsServer } from "../redux/actions/customViewsActions";
import { getConfigurationFilesServer } from "../redux/actions/configurationFilesActions";

interface FetchLogRecordsProps {
  dispatchFunc: any;
  logRecords?: LogRecordsData;
  sessionId: string;
}

export const fetchLogRecordsHelper = ({ dispatchFunc, logRecords, sessionId }: FetchLogRecordsProps) => {
  const startIndex = !logRecords?.["log-records"]?.length
    ? 0
    : (logRecords["log-records"].slice(-1).pop()?.["log-record-index"] || -1) + 1;

  dispatchFunc(
    fetchLogRecordsServer({
      "simulation-session-id": +sessionId,
      "start-index": startIndex,
    }),
  );
};

const withSimulation = (Component: any, refreshIntervalMs?: number) => {
  const Simulation = (props: any) => {
    const dispatch = useDispatch();
    const { simulationId, sessionId } = useParams();
    const [openSideBar, setOpenSideBar] = useState(true);

    const simulation = useSelector(getCurrentSimulation);
    const customViews = useSelector(getSimulationCustomViews);
    const logRecords = useSelector(getLogRecords);
    const timeInformation = useSelector(getTimeInformation);
    const sessionInformation = useSelector(getSessionInformation);

    const handleToggleSideBar = () => {
      setOpenSideBar(!openSideBar);
    };

    const isDataFetched = useRef(false);

    const fetchAllData = (disableLoaders?: boolean) => {
      if (simulationId && sessionId) {
        dispatch(getSimulationCustomViewsServer(+simulationId));
        dispatch(getSimulationDataServer({ simulationId: +simulationId, disableLoaders }));
        dispatch(getConfigurationFilesServer({}));

        if (sessionId && !Number.isNaN(Number(sessionId))) {
          if (sessionInformation?.["simulation-session-status"] !== SessionStatus.uninitialized) {
            dispatch(queryTimeInformationServer(+sessionId));
            dispatch(
              runSimulationSessionActionServer({
                "simulation-session-id": +sessionId,
                "action-type": SimulationSessionActionType.queryStatus,
                disableLoaders,
              }),
            );

            fetchLogRecordsHelper({ dispatchFunc: dispatch, logRecords, sessionId });
          }
        } else dispatch(clearSimulationSession());
      }
    };

    useEffect(() => {
      if (logRecords?.["log-records"]?.length) dispatch(updateLogRecords(logRecordsClearState));
    }, [sessionId]);

    useEffect(() => {
      if (!isDataFetched.current) {
        fetchAllData();
        isDataFetched.current = true;
      }
    }, []);

    useEffect(() => {
      if (refreshIntervalMs) {
        const timerId = setInterval(() => {
          fetchAllData(true);
        }, refreshIntervalMs);
        return () => clearInterval(timerId);
      }
    }, [refreshIntervalMs, sessionId, simulation, sessionInformation, timeInformation, customViews, logRecords]);

    return (
      <>
        <Navigation openSideBar={openSideBar} handleToggleSideBar={handleToggleSideBar} />
        <Grid container flexWrap="nowrap" {...props}>
          <Sidebar openSideBar={openSideBar} handleToggleSideBar={handleToggleSideBar} />
          <Wrapper container gap={{ sm: "10px", lg: "16px" }} alignContent="flex-start">
            <Component {...props} simulationId={simulationId} sessionId={sessionId} />
          </Wrapper>
        </Grid>
      </>
    );
  };

  return Simulation;
};

const Wrapper = styled(Grid)(({ theme }) => ({
  padding: "18px 24px 0",
  width: "auto",
  flex: 1,
  overflow: "hidden",
  [theme.breakpoints.down("lg")]: {
    padding: "10px 10px 0",
  },
}));

export default withSimulation;
