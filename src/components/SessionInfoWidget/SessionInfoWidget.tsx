import Container from "../WidgetContainer/WidgetContainer";
import DataTable from "../Tables/DataTable";
import { Session } from "../../types/simulations";
import { SimulationRunMode, TimeInformation } from "../../types/simulations";
import React from "react";

interface Props {
  data: Session;
  overrideFileName: string;
}

const mapRunModeText = {
  [SimulationRunMode.asFastAsPossible]: "As fast as possible",
  [SimulationRunMode.realTime]: "Real-time",
  [SimulationRunMode.specificSpeed]: "Specific speed",
};

const SessionInformation = ({ data, overrideFileName }: Props) => {
  const mappedData = [
    {
      id: "session_info-simulation_name",
      cells: ["Simulation Name", data["simulation-name"]],
    },
    {
      id: "session_info-initial_conditions",
      cells: ["Default Initial Conditions File", data["initial-conditions-name"]],
    },
    {
      id: "session_info-override_initial_conditions",
      cells: ["Override Initial Conditions File", overrideFileName],
    },
    {
      id: "session_info-scenario_name",
      cells: ["Scenario File", data["scenario-name"]],
    },
    {
      id: "session_info-controller_ip",
      cells: ["Controller IP", data["simulation-controller-address"]],
    },
    {
      id: "session_info-simulation_status",
      cells: ["Simulation Status", data["simulation-session-status"]],
    },
    {
      id: "session_info-simulation_run_speed",
      cells: [
        "Simulation Run Speed",
        `x ${data["simulation-execution-speed"]}   (${mapRunModeText[data["simulation-run-mode"]]})`,
      ],
    },
    {
      id: "session_info-n_processes",
      cells: ["# of Processes", data["number-of-processes"]],
    },
    {
      id: "session_info-n_systems_models",
      cells: ["User license usage", data["user-license-usage-info"]],
    },
    {
      id: "session_info-n_active_sessions",
      cells: ["Organization license usage", data["total-license-usage-info"]],
    },
  ];

  return (
    <Container title="Session Information">
      <DataTable data={mappedData} />
    </Container>
  );
};

export default React.memo(SessionInformation, (prev, next) => {
  if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
    return false;
  }
  return true;
});
