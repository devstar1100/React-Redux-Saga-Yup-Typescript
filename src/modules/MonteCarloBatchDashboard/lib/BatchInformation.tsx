import React from "react";
import Container from "../../../components/WidgetContainer";
import DataTable from "../../../components/Tables/DataTable";
import { MonteCarloBatch } from "../../../types/monteCarloBatches";

interface Props {
  data: MonteCarloBatch;
}

const BatchInformation = ({ data }: Props) => {
  const mappedData = [
    {
      id: "simulation_name",
      cells: ["Simulation Name", data["simulation-name"]],
    },
    {
      id: "run_prefix",
      cells: ["Run Prefix", data["run-prefix"]],
    },
    {
      id: "parametes_file",
      cells: ["Input/Output parameters file", data["input-output-parameters-file-name"]],
    },
    {
      id: "master_seed",
      cells: ["Master Seed", data["master-seed"]],
    },
    {
      id: "last_run_index",
      cells: ["Last Run Index", data["last-run-index"]],
    },
    {
      id: "sleep_time_between_run",
      cells: ["Sleep time between runs", data["sleep-seconds-between-runs"]],
    },
  ];

  return (
    <Container title="Batch Information">
      <DataTable data={mappedData} />
    </Container>
  );
};

export default React.memo(BatchInformation, (prev, next) => {
  if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
    return false;
  }
  return true;
});
