import React, { ReactElement } from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { styled } from "@mui/material";

export interface IDataTableRow {
  id: string | number;
  cells: Array<string | number | ReactElement>;
}
[];

const DataTableRow = ({ id, cells }: IDataTableRow) => {
  const largeTable = cells.length >= 3;

  return (
    <Row key={id} className={largeTable ? "largeTableClass" : ""}>
      {cells.map((value, idx) => {
        return <TableCell key={`${id}-${idx}`}>{value}</TableCell>;
      })}
    </Row>
  );
};

const Row = styled(TableRow)(() => ({
  "&:hover > :last-child div": {
    opacity: 1,
    visibility: "visible",
  },
}));

export default React.memo(DataTableRow, (prev, next) => {
  try {
    if (JSON.stringify(prev.cells) !== JSON.stringify(next.cells)) {
      return false;
    }
  } catch {
    return false;
  }

  if (prev.id !== next.id) {
    return false;
  }

  return true;
});
