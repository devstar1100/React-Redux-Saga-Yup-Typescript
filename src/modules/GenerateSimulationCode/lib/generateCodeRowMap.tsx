import { ReactElement } from "react";
import { NavigateFunction } from "react-router";
import { Checkbox, Tooltip } from "@mui/material";

import { Filter, Row } from "../../../components/Tables/CheckboxTable/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { Simulation, SimulationEnumType } from "../../../types/simulations";
import FillCheckbox from "../../../components/Icons/FillCheckbox";
import EmptyCheckbox from "../../../components/Icons/EmptyCheckbox";

interface Props {
  rows: Simulation[];
  navigate: NavigateFunction;
  handleCodeGeneration: (simulationId: number) => void;
  handleBuildExecutable: (simulationId: number) => void;
  enumerators?: SimulationEnumType[];
}

// Helper function to get enum value string by ID
const getEnumStringByValue = (
  enumerators: SimulationEnumType[] | undefined,
  enumType: string,
  valueId: number,
): string => {
  if (!enumerators) return "";

  const enumData = enumerators.find((enumerator) => enumerator["enum-type"] === enumType);
  if (!enumData) return "";

  const enumValue = enumData["enum-values"].find((value) => value["enum-value-id"] === valueId);
  return enumValue ? enumValue["enum-value-string"] : "";
};

// Helper function to determine if Generate Code should be disabled
const isGenerateCodeDisabled = (status: string): boolean => {
  return status === "In development" || status === "Production";
};

// Helper function to determine if Build Executable should be disabled
const isBuildExecutableDisabled = (status: string): boolean => {
  const disabledStatuses = ["Allowed to delete", "Production", "In development", "Executable building"];
  return disabledStatuses.includes(status);
};

// Helper function to generate tooltip message for Generate Code
const getGenerateCodeTooltip = (status: string, enumerators?: SimulationEnumType[]): string => {
  const allowedToDeleteStatus = getEnumStringByValue(enumerators, "simulation-statuses", 3) || "Allowed to delete";
  return `Simulation status is "${status}". It should be "${allowedToDeleteStatus}" in order to Generate.`;
};

// Helper function to generate tooltip message for Build Executable
const getBuildExecutableTooltip = (status: string, enumerators?: SimulationEnumType[]): string => {
  if (status === "Executable building") {
    return "Build is currently in progress.";
  }
  const codeGeneratedStatus = getEnumStringByValue(enumerators, "simulation-statuses", 101) || "Code generated";
  return `Simulation status is "${status}". It should be "${codeGeneratedStatus}" or above in order to Build.`;
};

export const formatSimulationRow = ({
  rows,
  navigate,
  handleCodeGeneration,
  handleBuildExecutable,
  enumerators,
}: Props): Row[] =>
  rows.map((row) => {
    const simulationStatus = row["simulation-status"] as string;
    const simulationStatusId = parseInt(row["simulation-status-id"], 10);
    const simulationStatusText = getEnumStringByValue(enumerators, "simulation-statuses", simulationStatusId);

    const generateCodeDisabled = isGenerateCodeDisabled(simulationStatus);
    const buildExecutableDisabled = isBuildExecutableDisabled(simulationStatus);

    // Determine the text for Build Executable link based on status
    const buildExecutableText = simulationStatus === "Executable building" ? "Building..." : "Build executable";

    return {
      id: row["simulation-id"],
      checked: false,
      cells: [
        {
          align: "left",
          text: row["simulation-name"] || "-",
          handler: () => navigate(`${pages.editSimulation()}/${row["simulation-id"]}`),
        },
        {
          align: "left",
          text: row["develop-simulation-output-folder-path"],
        },
        {
          align: "center",
          text: simulationStatusText,
        },
        {
          align: "center",
          text: "Generate code",
          decorator: (text: string | ReactElement) => {
            const linkContent = (
              <span
                style={{
                  cursor: generateCodeDisabled ? "default" : "pointer",
                  color: generateCodeDisabled ? "#666" : "inherit",
                  textDecoration: generateCodeDisabled ? "none" : "underline",
                }}
              >
                {text}
              </span>
            );

            return generateCodeDisabled ? (
              <Tooltip title={getGenerateCodeTooltip(simulationStatus, enumerators)} arrow>
                {linkContent}
              </Tooltip>
            ) : (
              linkContent
            );
          },
          handler: generateCodeDisabled ? undefined : () => handleCodeGeneration(row["simulation-id"]),
        },
        {
          align: "center",
          text: buildExecutableText,
          decorator: (text: string | ReactElement) => {
            const linkContent = (
              <span
                style={{
                  cursor: buildExecutableDisabled ? "default" : "pointer",
                  color: buildExecutableDisabled ? "#666" : "inherit",
                  textDecoration: buildExecutableDisabled ? "none" : "underline",
                }}
              >
                {text}
              </span>
            );

            return buildExecutableDisabled ? (
              <Tooltip title={getBuildExecutableTooltip(simulationStatus, enumerators)} arrow>
                {linkContent}
              </Tooltip>
            ) : (
              linkContent
            );
          },
          handler: buildExecutableDisabled ? undefined : () => handleBuildExecutable(row["simulation-id"]),
        },
        {
          align: "center",
          text: (
            <Checkbox
              icon={<EmptyCheckbox />}
              checkedIcon={<FillCheckbox />}
              checked={row["simulation-executable-exists"] || false}
              disableRipple
              style={{ padding: 0, pointerEvents: "none" }}
            />
          ),
        },
      ],
    };
  });
