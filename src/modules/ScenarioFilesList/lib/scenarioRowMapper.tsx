import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable";
import { ScenarioFile } from "../../../types/scenarioFile";
import { pages } from "../../../lib/routeUtils";
import { getSimDependantPageFullLink } from "../../../lib/simulationConfigurationUtils";

export const formatScenarioRow = (
  rows: ScenarioFile[],
  navigate: NavigateFunction,
  simulationId: number,
  sessionId: number,
): Row[] => {
  return rows.map((row) => ({
    id: row["scenario-file-id"],
    checked: false,
    cells: [
      {
        align: "left",
        text: row["scenario-file-name"] || "-",
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () =>
          navigate(
            `${getSimDependantPageFullLink({ baseRoute: pages.editScenarioFile(), simulationId, sessionId })}/${
              row["scenario-file-id"]
            }`,
          ),
      },
      { align: "left", text: row["simulation-name"] },
      { align: "left", text: row["simulation-owner-name"] },
      {
        align: "center",
        text: row["total-number-of-events"],
      },
      {
        align: "center",
        text: row["total-number-of-lines"],
      },
      {
        align: "center",
        text: "View list",
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () =>
          navigate(
            `${getSimDependantPageFullLink({ baseRoute: pages.scenarioActions(), simulationId, sessionId })}/${
              row["scenario-file-id"]
            }`,
          ),
      },
    ],
  }));
};
