import { ReactElement } from "react";
import { NavigateFunction } from "react-router";
import { Row } from "../../../components/Tables/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { MonteCarloRecord } from "../../../types/monteCarloRecords";

export const formatMonteCarloRecordsRow = (
  rows: MonteCarloRecord[],
  navigate: NavigateFunction,
  simulationId: string,
  filename: string,
): Row[] => {
  return rows.map((row, index) => ({
    id: index,
    checked: false,
    cells: [
      {
        align: "left",
        text: String(row["record-type"] ?? "-"),
      },
      {
        align: "left",
        text: String(row.description ?? "-"),
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.editMonteCarloRecord()}/${simulationId}/${filename}/${row.description}`),
      },
      {
        align: "left",
        text: String(row["parameter-path"] ?? "-"),
      },
      {
        align: "center",
        text: String(row["parameter-value"] ?? "-"),
      },
      {
        align: "center",
        text: String(row["parameter-stddev"] ?? "-"),
      },
    ],
  }));
};
