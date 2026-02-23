import { ReactElement } from "react";
import { NavigateFunction } from "react-router";

import { Row } from "../../../components/Tables/CheckboxTable";
import { ConfigurationFile } from "../../../types/configurationFile";
import { pages } from "../../../lib/routeUtils";

export const formatConfigurationRow = (rows: ConfigurationFile[], navigate: NavigateFunction): Row[] => {
  return rows.map((row) => ({
    id: row["simulation-user-config-id"],
    checked: false,
    cells: [
      {
        align: "left",
        text: row["configuration-name"] || "-",
        decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
        handler: () => navigate(`${pages.modifyConfigurationFile()}/${row["simulation-user-config-id"]}`),
      },
      { align: "left", text: row["simulation-name"] },
      { align: "left", text: row["simulation-owner-name"] },
      {
        align: "center",
        text: row["default-initial-conditions-name"],
      },
      {
        align: "center",
        text: row["initial-conditions-overide-name"],
      },
      {
        align: "center",
        text: row["scenario-file-name"] || "-",
      },
    ],
  }));
};
