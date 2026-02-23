import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable";
import { ScenarioAction } from "../../../types/scenarioAction";
import { pages } from "../../../lib/routeUtils";
import { SimulationEnumType } from "../../../types/simulations";
import { getSimDependantPageFullLink } from "../../../lib/simulationConfigurationUtils";

interface Props {
  rows: ScenarioAction[];
  listId: number;
  navigate: NavigateFunction;
  simulationId: number;
  sessionId: number;
}

export const formatScenarioActionsRow = ({ rows, listId, navigate, simulationId, sessionId }: Props): Row[] =>
  rows.map((row) => {
    return {
      id: row["action-key"],
      checked: false,
      cells: [
        {
          align: "left",
          text: row["action-key"] || "-",
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () =>
            navigate(
              `${getSimDependantPageFullLink({
                baseRoute: pages.editScenarioAction(),
                simulationId,
                sessionId,
              })}/${listId}/${row["action-key"]}`,
            ),
        },
        { align: "left", text: row["action-type"] },
        {
          align: "left",
          text: String(row["action-time"]),
        },
        {
          align: "center",
          text: row["console-message"],
        },
        {
          align: "center",
          text: row["number-of-parameters"],
        },
      ],
    };
  });
