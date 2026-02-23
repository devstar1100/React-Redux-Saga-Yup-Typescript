import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { IModelInput } from "../../../types/modelInput";

interface Props {
  rows: IModelInput[];
  navigate: NavigateFunction;
  getMessageType: (key: number) => string;
}

export const formatModelInputRow = ({ rows, getMessageType, navigate }: Props): Row[] =>
  rows.map((row) => ({
    id: row["model-input-id"],
    checked: false,
    cells: [
      {
        align: "left",
        text: row["input-alias"].toString(),
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.editModelInputs()}/${row["simulation-name"]}/${row["model-input-id"]}`),
      },
      { align: "left", text: row["source-model-path"] },
      {
        align: "left",
        text: row["target-model-path"],
      },
      {
        align: "center",
        text: getMessageType(row["message-type"]),
      },
      {
        align: "center",
        text: row["generic-model-output-identifier"],
      },
    ],
  }));
