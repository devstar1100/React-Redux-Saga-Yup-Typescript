import React, { FC, ReactElement, ChangeEvent, Dispatch, MouseEvent, useEffect } from "react";
import Table from "@mui/material/Table";
import { Pagination as MuiPagination, styled, TableBody as MuiTableBody } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import { TableHead as MuiTableHead } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Checkbox as MuiCheckbox } from "@mui/material";
import ArrowDownIcon from "../../Icons/ArrowDownIcon";

export interface Cell {
  align: "left" | "center" | "right";
  text: string | ReactElement | ReactElement[];
  decorator?: (text: string | ReactElement) => ReactElement;
  handler?: (e?: MouseEvent<HTMLTableCellElement>) => void;
}

export interface Row {
  id: number | string;
  cells: Cell[];
  checked?: boolean;
}

export interface Header {
  align: "left" | "center" | "right";
  text: string;
  filterable?: boolean;
  width?: number;
}

export interface Filter {
  index: number;
  filters: string[];
}

export interface Sort {
  direction: "top" | "bottom";
  colIndex: number;
}

export interface Props {
  rows: Row[];
  headers: Header[];
  handleCheckAll?: (status: boolean) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleCheck?: (id: number) => (e: ChangeEvent<HTMLInputElement>) => void;
  page: number;
  setPage: Dispatch<number>;
  rowsPerPage: number;
  sortColIndex: number;
  setSortColIndex: Dispatch<Sort>;
  sortDirection: "top" | "bottom";
}

const CheckboxTable: FC<Props> = ({
  rows,
  headers,
  handleCheckAll,
  handleCheck,
  page,
  setPage,
  rowsPerPage,
  sortColIndex,
  setSortColIndex,
  sortDirection,
}) => {
  const isWithCheckboxes = !!handleCheck && !!handleCheckAll;

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

  const rowsOnPage = (row: Row, index: number) => {
    if (index >= page * rowsPerPage - rowsPerPage && index < page * rowsPerPage) return true;

    return false;
  };

  const sortRows = (prev: Row, next: Row) => {
    const prevText = prev.cells[sortColIndex].text;
    const nextText = next.cells[sortColIndex].text;
    let newDirection = prevText > nextText ? -1 : 1;

    if (sortDirection === "top") newDirection = prevText < nextText ? -1 : 1;

    return newDirection;
  };

  const handleSortClick = (header: Header, index: number) => () => {
    const sortIndex = header.filterable ? index : sortColIndex;
    setSortColIndex({
      direction: sortDirection === "top" ? "bottom" : "top",
      colIndex: sortIndex,
    });
  };

  const currentRows = rows.filter(rowsOnPage).sort(sortRows);

  useEffect(() => {
    if (page * rowsPerPage - rowsPerPage + 1 > rows.length) setPage(1);
  }, [rows.length]);

  useEffect(() => {
    if (page < 1) setPage(1);
  }, [page]);

  return (
    <div>
      <Table sx={{ minWidth: 750, borderCollapse: "separate" }} aria-labelledby="tableTitle">
        <TableHead isWithCheckboxes={isWithCheckboxes}>
          <TableRow>
            {isWithCheckboxes && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={currentRows.every((row) => row.checked)}
                  onChange={handleCheckAll(currentRows.every((row) => row.checked))}
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                />
              </TableCell>
            )}
            {headers.map((header, index) => (
              <TableCell
                key={index}
                align={header.align}
                width={header.width + "%"}
                onClick={header.filterable ? handleSortClick(header, index) : () => null}
                sx={{ cursor: header.filterable ? "pointer" : "default" }}
              >
                {header.text}
                {header.filterable && (
                  <ArrowWrapper className={index === sortColIndex && sortDirection === "bottom" ? "rotate" : ""}>
                    <ArrowDownIcon />
                  </ArrowWrapper>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody isWithCheckboxes={isWithCheckboxes}>
          {currentRows.map((row) => (
            <TableRow key={row.id}>
              {isWithCheckboxes && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={row.checked}
                    onChange={handleCheck(row.id as number)}
                    inputProps={{
                      "aria-labelledby": "1",
                    }}
                  />
                </TableCell>
              )}
              {row.cells.map((cell, index) => (
                <TableCell key={index} align={cell.align} onClick={cell.handler}>
                  {cell.decorator ? cell.decorator(<>{cell.text}</>) : cell.text}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination>
        <Typography className="pagination-label">
          Showing {page * rowsPerPage - rowsPerPage + 1} to {Math.min(page * rowsPerPage, rows.length)} of {rows.length}{" "}
          results
        </Typography>
        <Pagination
          onChange={handleChangePage}
          boundaryCount={0}
          siblingCount={2}
          page={page}
          count={Math.ceil(rows.length / rowsPerPage)}
          shape="rounded"
        />
      </TablePagination>
    </div>
  );
};

const TableHead = styled(MuiTableHead)<{ isWithCheckboxes: boolean }>(({ theme, isWithCheckboxes }) => ({
  ".MuiTableCell-root": {
    background: theme.palette.main[400],
    color: theme.palette.main[50],
    borderLeft: "1px solid #1F1F22",
    borderBottom: "1px solid #1F1F22",
    padding: "6px 12px",
    fontWeight: theme.typography.h6.fontWeight,

    "&:first-child": {
      padding: isWithCheckboxes ? "0" : "6px 12px",
      minWidth: isWithCheckboxes ? "44px" : "0",
      borderRadius: "9px 0 0 0",
      borderLeft: "1px solid #454545",
    },

    "&:last-child": {
      borderRight: "1px solid #454545",
      borderRadius: "0 9px 0 0 ",
    },
  },
}));

const TableBody = styled(MuiTableBody)<{ isWithCheckboxes: boolean }>(({ theme, isWithCheckboxes }) => ({
  ".MuiTableCell-root": {
    background: "#0C0C0C",
    color: "#B7B7B7",
    borderLeft: "1px solid #454545",
    borderBottom: "1px solid #454545",
    padding: "6px 12px",

    "&:first-child": {
      padding: isWithCheckboxes ? "0" : "6px 12px",
      minWidth: isWithCheckboxes ? "44px" : "0",
      backgroundColor: theme.palette.main[700],
    },

    "&:last-child": {
      borderRight: "1px solid #454545",
    },
  },
}));

const ArrowWrapper = styled("span")({
  marginLeft: "7px",
  position: "relative",
  top: "2px",
  display: "inline-block",

  "&.rotate": {
    transform: "rotate(180deg)",
    top: "-2px",
  },
});

const Checkbox = styled(MuiCheckbox)(({ theme }) => ({
  color: theme.palette.main[200],
  width: "100%",

  ".MuiSvgIcon-root ": {
    width: "14px",
  },
}));

const TablePagination = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  height: "62px",
  padding: "0 16px",
  backgroundColor: theme.palette.additional[700],
  border: `1px solid ${theme.palette.main[400]}`,
  borderTop: "none",
  borderRadius: "0 0 9px 9px",

  ".pagination-label": {
    color: theme.palette.main[200],
  },
}));

const Pagination = styled(MuiPagination)(({ theme }) => ({
  li: {
    border: `1px solid ${theme.palette.main[400]}`,
    borderLeft: "none",
    width: "38px",
    height: "38px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    "&:first-child": {
      borderLeft: `1px solid ${theme.palette.main[400]}`,
      borderRadius: "9px 0 0 9px",
    },

    "&:last-child": {
      borderRadius: "0 9px 9px 0",
      color: theme,
    },
  },

  ".MuiButtonBase-root": {
    color: theme.palette.main[200],
    height: "100%",
    width: "100%",
    padding: 0,
    margin: 0,

    "&.Mui-selected": {
      backgroundColor: "#141414",
      color: "#B7B7B7",
    },
  },

  "li:has(.MuiPaginationItem-ellipsis)": {
    display: "none",
  },

  "li:has(.MuiPaginationItem-text):nth-child(7)": {
    // display: "none",
  },
}));

export default CheckboxTable;
