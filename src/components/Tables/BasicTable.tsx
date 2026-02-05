import React, { FC } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material";

export interface Row {
  id: string | number;
  list: (string | number)[];
}

interface Props {
  headers: string[];
  rows: Row[];
}

const BasicTable: FC<Props> = ({ headers, rows }) => {
  return (
    <TableContainer>
      <CustomTable>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={index} align="center">
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              {row.list.map((elem, index) => (
                <TableCell key={index} align="center">
                  {elem}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </CustomTable>
    </TableContainer>
  );
};

const CustomTable = styled(Table)(({ theme }) => ({
  borderCollapse: "separate",

  ".MuiTableHead-root": {
    ".MuiTableCell-root": {
      padding: 0,
      width: "120px",
      height: "44px",
      backgroundColor: theme.palette.table.tableHead,
      color: theme.typography.allVariants.color,
      border: `1px solid ${theme.palette.table.tableBorder}`,
      fontWeight: theme.typography.body2.fontWeight,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body2.fontSize,

      "&:first-of-type": {
        borderRadius: "9px 0 0 0",
      },

      "&:last-child": {
        borderRadius: "0 9px 0 0",
      },
    },
  },

  ".MuiTableBody-root": {
    ".MuiTableCell-root": {
      backgroundColor: theme.palette.table.tableCell,
      color: theme.typography.allVariants.color,
      border: `1px solid ${theme.palette.table.tableBorder}`,
      padding: 0,
      height: "41px",
      width: "120px",
      fontWeight: theme.typography.body2.fontWeight,
      fontFamily: theme.typography.secondaryFont,
    },

    ".MuiTableRow-root:last-child": {
      ".MuiTableCell-root": {
        "&:first-of-type": {
          borderRadius: "0 0 0 9px",
        },

        "&:last-child": {
          borderRadius: "0 0 9px 0",
        },
      },
    },
  },
}));

export default BasicTable;
