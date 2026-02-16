import { ReactElement } from "react";
import { NavigateFunction } from "react-router";
import { Row } from "../../../components/Tables/CheckboxTable/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { MonteCarloFile } from "../../../types/monteCarloFile";

export const formatMonteCarloFileRow = (rows: MonteCarloFile[], navigate: NavigateFunction): Row[] => {
  return rows.map((row) => ({
    id: row.id,
    checked: false,
    cells: [
      {
        align: "left",
        text: String(row["name"] ?? "-"),
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.editMonteCarloFile(row["simulation-id"], row.name)}`),
      },
      {
        align: "left",
        text: String(row["simulation-name"] ?? "-"),
      },
      {
        align: "left",
        text: String(row["number-of-input-records"] ?? "-"),
      },
      {
        align: "left",
        text: String(row["number-of-output-records"] ?? "-"),
      },
      {
        align: "center",
        text: "View list",
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.addMonteCarloFile()}`),
      },
    ],
  }));
};
