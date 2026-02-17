import React from "react";
import Container from "../../../components/WidgetContainer/WidgetContainer";
import DataTable from "../../../components/Tables/DataTable";
import { MonteCarloBatch } from "../../../types/monteCarloBatches";

interface Props {
  data: MonteCarloBatch;
}

const BatchStatus = ({ data }: Props) => {
  const mappedData = [
    {
      id: "status",
      cells: ["Status", data?.["current-state"] ?? "unknown"],
    },
    {
      id: "planned_finished_active_runs",
      cells: [
        "Planned/Finished/Active runs",
        `${data?.["number-of-planned-runs"] ?? 0}/${data?.["number-of-finished-runs"] ?? 0}/${
          data?.["number-of-active-runs"] ?? 0
        }`,
      ],
    },
    {
      id: "unsuccessful_runs",
      cells: [
        "Unsuccessful Runs",
        (data?.["number-of-finished-runs"] ?? 0) - (data?.["number-of-successfull-runs"] ?? 0),
      ],
    },
    {
      id: "max_execution_time_speed",
      cells: ["Max Execution Time / Speed", data?.["max-execution-time-sec"] ?? 0],
    },
  ];

  return (
    <Container title="Batch Execution Status">
      <DataTable data={mappedData} />
    </Container>
  );
};

export default React.memo(BatchStatus, (prev, next) => {
  if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
    return false;
  }
  return true;
});
