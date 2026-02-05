import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { ISimulatedSystem } from "../../../types/simulatedSystems";
import { Simulation, SimulationEnumType } from "../../../types/simulations";

interface Props {
  rows: ISimulatedSystem[];
  navigate: NavigateFunction;
  simulations: Simulation[];
  enumerators: SimulationEnumType[];
}

export const formatSimulatedSystemsRow = ({ rows, navigate, simulations, enumerators }: Props): Row[] => {
  // Find the high-level-systems enum
  const highLevelSystemsEnum = enumerators?.find((enumerator) => enumerator["enum-type"] === "high-level-systems");

  return rows.map((row) => {
    const simulationId = simulations.find((item) => item["simulation-name"] === row["simulation-name"])?.[
      "simulation-id"
    ];

    // Get the high-level-system name from the enum using the high-level-model ID
    let systemTypeName = "Not set";

    if (highLevelSystemsEnum && row["high-level-model"] !== undefined && row["high-level-model"] !== null) {
      const foundEnum = highLevelSystemsEnum["enum-values"].find(
        (item) => item["enum-value-id"] === row["high-level-model"],
      );
      systemTypeName = foundEnum?.["enum-value-string"] || `ID: ${row["high-level-model"]} (not found)`;
    }

    return {
      id: row["model-id"],
      checked: false,
      cells: [
        {
          align: "left",
          text: row["model-full-path-with-instances"],
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () => navigate(`${pages.editSimulatedSystem()}/${row["simulation-name"]}/${row["model-id"]}`),
        },
        {
          align: "left",
          text: row["simulation-name"],
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () => {
            navigate(`${pages.editSimulation()}/${simulationId}`);
          },
        },
        {
          align: "center",
          text: systemTypeName,
        },
        {
          align: "center",
          text: row["model-class-name"],
        },
        {
          align: "left",
          text: row["model-alias"],
        },
        {
          align: "left",
          text: row["number-of-child-models"].toString(),
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () => navigate(`${pages.simulatedModelList(row["simulation-name"])}`),
        },
      ],
    };
  });
};
