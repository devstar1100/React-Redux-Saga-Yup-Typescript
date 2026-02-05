import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable/CheckboxTable";
import { SimulationEnumType } from "../../../types/simulations";
import { pages } from "../../../lib/routeUtils";
import { IModelOutput } from "../../../types/modelOutput";

export const formatModelOutputRow = (
  rows: IModelOutput[],
  navigate: NavigateFunction,
  messageTypesEnum?: SimulationEnumType,
): Row[] => {
  const getMessageType = (messageType: number) =>
    messageTypesEnum?.["enum-values"].find((el) => el["enum-value-id"] === messageType)?.["enum-value-string"];

  return rows.map((row, index) => ({
    id: row["model-output-id"],
    checked: false,
    cells: [
      {
        align: "left",
        text: row["output-alias"] ?? "-",
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.editModelOutput()}/${row["simulation-name"]}/${row["model-output-id"]}`),
      },
      { align: "left", text: row["model-full-path"] ?? "-" },
      { align: "left", text: getMessageType(row["message-type"]) ?? "-" },
      {
        align: "center",
        text: row["output-structure-name"] ?? "-",
      },
      {
        align: "center",
        text: row["generic-model-output-identifier"].toString() ?? "-",
      },
      {
        align: "center",
        text: row["number-of-model-using-as-input"].toString() ?? "-",
      },
    ],
  }));
};
