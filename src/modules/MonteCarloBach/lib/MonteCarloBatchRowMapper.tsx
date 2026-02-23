import { ReactElement } from "react";
import { NavigateFunction } from "react-router";
import { Filter, Row } from "../../../components/Tables/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { MonteCarloBatch } from "../../../types/monteCarloBatches";

export const formatMonteCarloBatchRow = (
  rows: MonteCarloBatch[],
  navigate: NavigateFunction,
  statusFilters?: Filter,
): Row[] => {
  return rows.map((row, index) => ({
    id: row["batch-id"],
    checked: false,
    cells: [
      {
        align: "left",
        text: String(row["simulation-name"] ?? "-"),
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.editMonteCarloBatch()}/${row["batch-id"]}`),
      },
      {
        align: "left",
        text: String(row["run-prefix"] ?? "-"),
      },
      {
        align: "left",
        text: String(row["number-of-planned-runs"] ?? "-"),
      },
      {
        align: "left",
        text: String(row["max-execution-time-sec"] ?? "-"),
      },
      {
        align: "center",
        text: row["input-output-parameters-file-name"] ?? "-",
      },
    ],
  }));
};
