import React, { FC, useState, useRef, useEffect, ReactNode, CSSProperties } from "react";
import {
  styled,
  Table,
  TableCell,
  TableRow,
  TableBody as MuiTableBody,
  TableHead as MuiTableHead,
  MenuItem,
  ListItemIcon,
  Typography,
  Menu,
  MenuProps,
  Box,
} from "@mui/material";
import { DragDropContext, Draggable, DropResult, Droppable } from "react-beautiful-dnd";

import BrushIcon from "../../Icons/BrushIcon";
import TrashIcon from "../../Icons/TrashIcon";
import Textfield from "../../Textfield";
import DuplicateIcon from "../../Icons/DuplicateIcon";
import ThreeDotsIcon from "../../Icons/ThreeDotsIcon";
import { ActionsList } from "../../../types/actions";
import { ReorderIcon } from "../../Icons/ReorderIcon";

export interface Header {
  text: string;
  preciseWidth?: number;
  relativeWidth?: string;
}

export interface ReorderTableRow {
  id: string | number;
  cells: {
    id: string | number;
    key: string;
    title: ReactNode;
    placeholder?: string;
    valueType?: "string" | "number";
    rightToLeft?: boolean;
    additionalStyles?: CSSProperties;
  }[];
}
[];

export interface Props {
  data: ReorderTableRow[];
  headers: Header[];
  onCellChange: (rowId: string, propKey: string, value: string, valueType: "string" | "number") => void;
  onReorder: (result: DropResult) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRowSelect?: (id: string) => void;
  isDisabled?: boolean;
}

const ReoderTable: FC<Props> = ({
  data,
  headers,
  onReorder,
  onEdit,
  onDuplicate,
  onDelete,
  onCellChange,
  onRowSelect,
  isDisabled = false,
}) => {
  const tableRef = useRef<HTMLDivElement | null>(null);

  const [contextMenuIdx, setContextMenuIdx] = useState<number>(-1);
  const [activeCell, setActiveCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);

  const handleActiveCell = (rowIndex: number, cellIndex: number) => {
    if (isDisabled) return;

    setActiveCell({ rowIndex, cellIndex });
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (isDisabled) return;

    if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
      setActiveCell(null);
    }
  };

  const handleKeyPress = (e: any, type?: "blur") => {
    if (isDisabled) return;

    if (e.code === "Enter" || type) {
      setActiveCell(null);
    }
  };

  const actionsList: ActionsList = [
    {
      icon: <BrushIcon />,
      title: "Edit",
      handlerFunc: () => onEdit(String(data[contextMenuIdx].id)),
    },
    {
      icon: <DuplicateIcon />,
      title: "Duplicate",
      handlerFunc: () => onDuplicate(String(data[contextMenuIdx].id)),
    },
    {
      icon: <TrashIcon />,
      title: "Delete",
      handlerFunc: () => onDelete(String(data[contextMenuIdx].id)),
    },
  ];

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: "auto", borderCollapse: "separate", tableLayout: "auto" }} aria-labelledby="tableTitle">
        <TableHead>
          <TableRow>
            <TableCell width="39px" />
            {headers.map((header, index) => (
              <TableCell
                key={index}
                align="center"
                style={{
                  maxWidth: header.preciseWidth + "px",
                  minWidth: header.preciseWidth + "px",
                  width: header.relativeWidth,
                }}
              >
                {header.text}
              </TableCell>
            ))}
            <TableCell width="52px" />
          </TableRow>
        </TableHead>
        <DragDropContext onDragEnd={onReorder}>
          <Droppable droppableId="table">
            {(provided) => (
              <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                {data.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided: any, snapshot) => {
                      if (snapshot.isDragging) {
                        provided.draggableProps.style.left = provided.draggableProps.style.offsetLeft;
                        provided.draggableProps.style.top = provided.draggableProps.style.offsetTop;
                      }
                      return (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          onClick={() => onRowSelect?.(String(item.id))}
                        >
                          <TableCell align="center" {...provided.dragHandleProps}>
                            <ReorderIcon />
                          </TableCell>
                          {item.cells.map(
                            (
                              {
                                id,
                                key,
                                title,
                                placeholder = "",
                                valueType = "string",
                                rightToLeft = false,
                                additionalStyles = {},
                              },
                              order,
                            ) => {
                              const isActive =
                                activeCell && activeCell.rowIndex === index && activeCell.cellIndex === order;

                              return (
                                <TableCell
                                  ref={isActive ? null : tableRef}
                                  key={id}
                                  align="center"
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    padding: isActive ? 0 : "12px",
                                    maxWidth: headers[order].preciseWidth + "px",
                                    minWidth: headers[order].preciseWidth + "px",
                                    textDecoration: "none",
                                    textAlign: rightToLeft ? "left" : "center",
                                    direction: rightToLeft ? "rtl" : "ltr",
                                    width: headers[order].relativeWidth,
                                    ...additionalStyles,
                                  }}
                                  onClick={() => handleActiveCell(index, order)}
                                >
                                  {isActive ? (
                                    <Textfield
                                      autoFocus
                                      value={title}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        onCellChange(String(item.id), key, e.target.value, valueType)
                                      }
                                      onKeyPress={handleKeyPress}
                                      onBlur={(e) => handleKeyPress(e, "blur")}
                                    />
                                  ) : (
                                    title || placeholder
                                  )}
                                </TableCell>
                              );
                            },
                          )}
                          <TableCell align="center">
                            <Actions
                              index={index}
                              actionsList={actionsList}
                              setIsContextMenuActive={setContextMenuIdx}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>
    </div>
  );
};

interface ActionsProps {
  actionsList: ActionsList;
  index: number;
  setIsContextMenuActive: (index: number) => void;
}

const Actions = ({ actionsList, index, setIsContextMenuActive }: ActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleDotsClick = (event: any, index: number) => {
    setAnchorEl(event.currentTarget);
    setIsContextMenuActive(index);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setIsContextMenuActive(-1);
  };

  return (
    <ActionWrapper position="relative">
      <ActionWrapper minWidth="18px" onClick={(e) => handleDotsClick(e, index)}>
        <ThreeDotsIcon />
      </ActionWrapper>

      <StyledMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {actionsList.map(({ icon, title, handlerFunc }) => (
          <MenuItem
            key={title}
            onClick={() => {
              handlerFunc();
              handleClose();
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <Typography variant="subtitle1" fontFamily="fontFamily" color="grey.100">
              {title}
            </Typography>
          </MenuItem>
        ))}
      </StyledMenu>
    </ActionWrapper>
  );
};

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "8px",
    border: `1px solid ${theme.palette.grey[400]}`,
    minWidth: 140,
    background: theme.palette.grey[600],
    padding: "12px 16px",
    "& .MuiList-root": {
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    "& .MuiListItemIcon-root": {
      minWidth: "auto",
    },
    "& .MuiMenuItem-root": {
      display: "flex",
      alignItems: "center",
      columnGap: "10px",
      padding: "8px 6px",
      borderRadius: "5px",
      cursor: "pointer",
      "& svg": {
        width: "14px",
      },
      "&:first-of-type": {
        "& svg > path": {
          stroke: theme.palette.grey[100],
        },
      },
      "&:hover": {
        backgroundColor: theme.palette.grey[500],
        color: theme.palette.grey[50],
      },
    },
  },
}));

const TableHead = styled(MuiTableHead)(({ theme }) => ({
  ".MuiTableCell-root": {
    background: theme.palette.main[400],
    color: theme.palette.main[50],
    borderLeft: `1px solid ${theme.palette.grey[500]}`,
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
    padding: "12px",
    fontWeight: theme.typography.h6.fontWeight,

    "&:first-of-type": {
      padding: "0",
      borderRadius: "9px 0 0 0",
      borderLeft: `1px solid ${theme.palette.grey[300]}`,
      minWidth: "44px",
    },

    "&:last-child": {
      borderRight: `1px solid ${theme.palette.grey[300]}`,
      borderRadius: "0 9px 0 0",
    },
  },
}));

const TableBody = styled(MuiTableBody)(({ theme }) => ({
  "& .MuiTableRow-root:hover": {
    ".MuiTableCell-root": {
      backgroundColor: theme.palette.grey[500],
    },
  },

  ".MuiTableCell-root": {
    background: theme.palette.grey[800],
    color: theme.palette.grey[100],
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    padding: "12px",

    "& .MuiInputBase-input": {
      padding: "11px",
      textAlign: "center",
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: 400,

      "@media (max-width: 1401px)": {
        fontSize: "12px",
        lineHeight: "18px",
      },
    },

    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderRadius: 0,
        border: "none !important",
      },
      "&.Mui-focused fieldset": {
        borderRadius: 0,
        border: "none !important",
      },
    },

    "&:first-of-type": {
      padding: "0",
      minWidth: "44px",
      backgroundColor: theme.palette.main[700],
    },

    "&:last-child": {
      borderRight: `1px solid ${theme.palette.grey[300]}`,

      "& > div": {
        justifyContent: "center",
      },
    },
  },

  "& .MuiTableRow-root:last-child > .MuiTableCell-root": {
    "&:first-of-type": {
      borderRadius: "0 0 0 9px",
    },

    "&:last-child": {
      borderRadius: "0 0 9px 0",
    },
  },
}));

const ActionWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  svg: {
    transform: "rotate(90deg)",
    cursor: "pointer",
  },
});

export default ReoderTable;
