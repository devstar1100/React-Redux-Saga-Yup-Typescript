import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable";
import { SimulatedModel } from "../../../types/SimulatedModel";
import { SimulationEnumType } from "../../../types/simulations";
import { pages } from "../../../lib/routeUtils";

export const formatSimulatedModelRow = (
  rows: SimulatedModel[],
  navigate: NavigateFunction,
  executionFrequencies?: SimulationEnumType,
  modelSources?: SimulationEnumType,
  highLevelModels?: SimulationEnumType,
): Row[] => {
  return rows.map((row) => ({
    id: row["model-id"],
    checked: false,
    cells: [
      {
        align: "left",
        text: row["model-full-path-with-instances"] || "-",
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.editSimulatedModel()}/${row["simulation-name"]}/${row["model-id"]}`),
      },
      {
        align: "left",
        text:
          modelSources?.["enum-values"]?.find((el) => el?.["enum-value-id"] === row["model-source"])?.[
            "enum-value-string"
          ] ?? "-",
      },
      {
        align: "center",
        text:
          highLevelModels?.["enum-values"]?.find((el) => el?.["enum-value-id"] === row["high-level-model"])?.[
            "enum-value-string"
          ] ?? "Not set",
      },
      {
        align: "center",
        text: row["model-class-name"] ?? "-",
      },
      {
        align: "center",
        text:
          executionFrequencies?.["enum-values"]?.find((el) => el?.["enum-value-id"] === row["model-frequency"])?.[
            "enum-value-string"
          ] ?? "",
      },
      {
        align: "center",
        text: row["number-of-input-messages"] ?? "-",
      },
      {
        align: "center",
        text: row["number-of-output-messages"] ?? "-",
      },
    ],
  }));
};
