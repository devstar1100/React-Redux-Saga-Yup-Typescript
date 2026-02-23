import Container from "../WidgetContainer";
import DataTable from "../Tables/DataTable";
import { SimulationRunMode, TimeInformation } from "../../types/simulations";
import { format, parseISO } from "date-fns";
import { parseISOLocal } from "../../lib/parseISOLocal";
import React from "react";

interface Props {
  data: TimeInformation;
}

const mapRunModeText = {
  [SimulationRunMode.asFastAsPossible]: "As fast as possible",
  [SimulationRunMode.realTime]: "Real-time",
  [SimulationRunMode.specificSpeed]: "Specific speed",
};

const dateFormat = "yyyy-MM-dd HH:mm:ss.SSS";

const TimeInformationBlock = ({ data }: Props) => {
  const mappedData = [
    {
      id: "time_information-utc_time",
      cells: [
        "Initial simulation time",
        data["simulation-initial-utc-time"] ? format(parseISO(data["simulation-initial-utc-time"]), dateFormat) : "",
      ],
    },
    {
      id: "time_information-local_time",
      cells: [
        "Current simulation time",
        data["simulation-current-utc-time"] ? format(parseISO(data["simulation-current-utc-time"]), dateFormat) : "",
      ],
    },
    {
      id: "time_information-simulation_time",
      cells: ["Elapsed simulation time", data["simulation-elapsed-time-seconds"] || ""],
    },
    {
      id: "time_information-max_tick_freq",
      cells: ["Simulation tick number", data["simulation-tick-number"] || 0],
    },
    {
      id: "time_information-tick_freq",
      cells: ["Tick Frequency", `${data["maximum-tick-frequency-hz"]} Hz`],
    },
    {
      id: "session_manager_connection_status",
      cells: ["Session Manager Connection Status", data["session-manager-connection-status"] || ""],
    },
  ];

  return (
    <Container title="Time Information">
      <DataTable data={mappedData} />
    </Container>
  );
};

export default React.memo(TimeInformationBlock, (prev, next) => {
  if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
    return false;
  }
  return true;
});
