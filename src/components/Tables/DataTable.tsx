import React, { FC, ReactElement } from "react";
import { Typography, styled } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";

import DataTableRow, { IDataTableRow } from "./DataTableRow";

interface IDataTable {
  data: IDataTableRow[];
}

const DataTable: FC<IDataTable> = ({ data }): ReactElement => (
  <CustomTable>
    <TableBody>
      {data.length ? (
        data.map((item) => <DataTableRow key={item.id + "-data-table-row-sim-dash"} id={item.id} cells={item.cells} />)
      ) : (
        <Typography align="center" variant={"subtitle1"} color="white" padding={"15px 0"}>
          No entries yet
        </Typography>
      )}
    </TableBody>
  </CustomTable>
);

const CustomTable = styled(Table)(({ theme }) => ({
  borderCollapse: "separate",
  ".MuiTableBody-root": {
    ".MuiTableRow-root:last-child td, &:last-child th": {
      border: 0,
    },
    ".largeTableClass td:nth-of-type(2)": {
      textAlign: "right",
      paddingRight: "65px",
    },
    ".MuiTableRow-root .MuiTableCell-root:last-child": {
      padding: "13px 0 13px 10px",
    },
    ".MuiTableCell-root": {
      borderBottom: `1px solid ${theme.palette.table.tableBorder}`,
      padding: "13px 0",
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      fontFamily: theme.typography.secondaryFont,
      color: theme.palette.textColor.light,
      "&:first-of-type": {
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.textColor.main,
      },
    },
  },
}));

export default React.memo(DataTable, (prev, next) => {
  try {
    if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
});
