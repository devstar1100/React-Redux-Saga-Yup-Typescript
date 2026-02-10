import { ReactElement } from "react";
import { NavigateFunction } from "react-router";
import { Filter, Row } from "../../../components/Tables/CheckboxTable/CheckboxTable";
import { pages } from "../../../lib/routeUtils";
import { Simulation } from "../../../types/simulations";
import { format, parseISO } from "date-fns";

export const formatSimulationRow = (rows: Simulation[], navigate: NavigateFunction, statusFilters: Filter): Row[] => {
  return rows
    .filter((row) => {
      const simulationStatus = row["simulation-status"].toLowerCase();
      if (statusFilters.filters.length) {
        for (let filter of statusFilters.filters) {
          filter = filter.toLowerCase().replace(" ", "-");

          return filter === simulationStatus;
        }
      }
      return row;
    })
    .map((row) => ({
      id: row["simulation-id"],
      checked: false,
      cells: [
        {
          align: "left",
          text: row["simulation-name"] || "-",
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () => navigate(`${pages.editSimulation()}/${row["simulation-id"]}`),
        },
        { align: "left", text: row["project-name"] },
        { align: "left", text: row["simulation-owner-name"] },
        {
          align: "left",
          text: row["simulation-executable-path"],
        },
        {
          align: "center",
          text: row["creation-date"] ? format(parseISO(row["creation-date"]), "yyyy-MM-dd HH:mm") : "-",
        },
      ],
    }));
};
