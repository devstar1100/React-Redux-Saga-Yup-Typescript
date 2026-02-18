import { useSelector } from "react-redux";
import { Box, Grid } from "@mui/material";
import { Simulation } from "../../types/simulations";
import { getMonteCarloBatches } from "../../redux/reducers/monteCarloBatchesReducer";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { getSimulations } from "../../redux/reducers/simulationsReducer";
import { useDispatch } from "react-redux";
import { getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { getMonteCarloBatchesListServer } from "../../redux/actions/monteCarloBatchesActions";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import Seo from "../../components/Seo/Seo";
import withSimulation from "../../hocs/withSimulation";
import PageLoader from "../../components/PageLoader/PageLoader";
import BatchInformation from "./lib/BatchInformation";
import BatchControls from "./lib/BatchControls";
import BatchStatus from "./lib/BatchStatus";
import LastSessions from "./lib/LastSessions";

const MonteCarloBatchDashboard = () => {
  const dispatch = useDispatch();
  const { batchId } = useParams();
  const batches = useSelector(getMonteCarloBatches);
  const simulationes = useSelector(getSimulations);
  const addSimulationNameToBatches = (simulationes: Simulation[], batches: MonteCarloBatch[]): MonteCarloBatch[] => {
    return batches.map((row) => {
      const simulation = simulationes.find((sim) => sim["simulation-id"] === row["simulation-id"]);
      if (!simulation) return row;
      return {
        ...row,
        "simulation-name": simulation["simulation-name"],
      };
    });
  };
  const displayInfo = addSimulationNameToBatches(simulationes, batches).find(
    (item) => item["batch-id"] === Number(batchId),
  );
  const [batchState, setBatchState] = useState<string>();

  const fetchAllData = () => {
    dispatch(getSimulationsExtendedInfoServer({}));
    dispatch(getMonteCarloBatchesListServer());
  };

  const refreshIntervalMs = 2000;

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (displayInfo) {
      setBatchState(displayInfo?.["current-state"]);
    }
  }, [batches, simulationes]);

  useEffect(() => {
    const timerId = setInterval(() => {
      fetchAllData();
    }, refreshIntervalMs);
    return () => clearInterval(timerId);
  }, [refreshIntervalMs]);

  return (
    <>
      <Seo title="Dashboard" />
      {displayInfo ? (
        <>
          <Box
            width="100%"
            gap="10px"
            sx={{
              display: "flex",
              justifyContent: "right",
            }}
          >
            <Grid width="6" height="fit-content" container gap={{ sm: "10px", lg: "16px" }}>
              <BatchControls batchId={displayInfo?.["batch-id"] as number} batchState={batchState as string} />
              <BatchStatus data={displayInfo} />
            </Grid>

            <Grid width="6" height="fit-content" container gap={{ sm: "10px", lg: "16px" }}>
              <BatchInformation data={displayInfo as MonteCarloBatch} />
            </Grid>
          </Box>
          <Grid width="100%" height="350px" overflow="scroll">
            <LastSessions data={displayInfo} />
          </Grid>
        </>
      ) : (
        <PageLoader />
      )}
    </>
  );
};

export default withSimulation(MonteCarloBatchDashboard);
