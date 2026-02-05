import React from "react";
import { Grid } from "@mui/material";

import Container from "../WidgetContainer/WidgetContainer";
import BasicTable from "../Tables/BasicTable";
import { LogRecordsData } from "../../types/simulations";

interface Props {
  data: Omit<LogRecordsData, "log-records">;
}

const LogStatistics = ({ data }: Props) => {
  const mappedData = [
    {
      id: "log_statistics",
      list: [
        data["total-number-of-fatals"],
        data["total-number-of-errors"],
        data["total-number-of-warnings"],
        data["total-number-of-log-records"],
      ],
    },
  ];

  return (
    <Container title="Log Statistics">
      <Grid pt="16px">
        <BasicTable headers={["# Fatals", "# Errors", "# Warnings", "Total"]} rows={mappedData} />
      </Grid>
    </Container>
  );
};

export default React.memo(LogStatistics, (prev, next) => {
  if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
    return false;
  }
  return true;
});
