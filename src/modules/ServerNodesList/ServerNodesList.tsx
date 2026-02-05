import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Box, styled, Typography } from "@mui/material";
import { useState, ChangeEvent, useEffect, ReactElement } from "react";

import Input from "../../components/Inputs/Input";
import Button from "../../components/Button/Button";
import withSimulation from "../../hocs/withSimulation";
import SearchIcon from "../../components/Icons/SearchIcon";
import PageLoader from "../../components/PageLoader/PageLoader";
import TableFilter from "../../components/TableFilter/TableFilter";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";
import { ServerNode } from "../../types/serverNode";
import { Simulation } from "../../types/simulations";
import { SimulationUser } from "../../types/simulationUser";
import { getIsHydrated } from "../../redux/reducers/appReducer";
import { getSimulations } from "../../redux/reducers/simulationsReducer";
import {
  GetServerNodesServerProps,
  deleteServerNodeServer,
  duplicateServerNodeServer,
  getServerNodesServer,
} from "../../redux/actions/serverNodesActions";
import { getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { getSimulationUsersServer } from "../../redux/actions/simulationUsersActions";
import { getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { getAreServerNodesLoading, getServerNodes } from "../../redux/reducers/serverNodesReducer";
import { pages } from "../../lib/routeUtils";
import { NavLink } from "react-router-dom";

const headers: Header[] = [
  {
    text: "Server node name",
    align: "center",
    filterable: true,
    width: 18.6,
  },
  {
    text: "Simulation Name",
    align: "center",
    filterable: true,
    width: 14.6,
  },
  {
    text: "Simulation Owner",
    align: "center",
    filterable: true,
    width: 16.6,
  },
  {
    text: "Simulation run mode",
    align: "center",
    filterable: true,
    width: 16.6,
  },
  {
    text: "Server Agent IP and Port",
    align: "center",
    filterable: false,
    width: 16.6,
  },
  {
    text: "API server IP and Port",
    align: "center",
    filterable: false,
    width: 16.6,
  },
];

const ServerNodesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rowsServer: ServerNode[] = useSelector(getServerNodes);
  const simulationUsers: SimulationUser[] = useSelector(getSimulationUsers);
  const simulations: Simulation[] = useSelector(getSimulations);
  const isHydrated = useSelector(getIsHydrated);
  const isLoading = useSelector(getAreServerNodesLoading);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 1,
    direction: "top",
  });
  const rowsPerPage = 10;

  const handleCheckAll = (status: boolean) => () => {
    const checkedRows = rows.map((row, index) => {
      if (index >= page * rowsPerPage - rowsPerPage && index < page * rowsPerPage) {
        row.checked = !status;
      }
      return row;
    });
    setRows(checkedRows);
  };

  const handleCheck = (id: number) => () => {
    const rowsCopy = [...rows];
    const activeRow = rowsCopy.find((row) => row.id === id);

    if (activeRow) activeRow.checked = !activeRow?.checked;
    setRows(rowsCopy);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  const filterRowsServer = (searchValue: string, serverNode: ServerNode) => {
    const searchText = searchValue.toLowerCase();
    const searchFields = ["simulation-server-node-name", "simulation-name", "simulation-owner-name"];

    for (const field of searchFields) {
      const fieldValue = serverNode[field as keyof ServerNode];
      if (fieldValue !== undefined && fieldValue !== null) {
        const text = fieldValue.toString().toLowerCase();
        if (text.includes(searchText)) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    if (isHydrated) {
      dispatch(getServerNodesServer({}));
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      dispatch(getSimulationUsersServer({}));
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      dispatch(getSimulationsExtendedInfoServer({}));
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!rowsServer) return;
    const rows: Row[] = rowsServer
      .filter((row) => filterRowsServer(searchValue, row))
      .map((row) => ({
        id: Number(row["simulation-server-node-id"]),
        checked: false,
        cells: [
          {
            align: "left",
            text: row["simulation-server-node-name"],
            decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
            handler: () => navigate(`${pages.editServerNode()}/${row["simulation-server-node-id"]}`),
          },
          { align: "left", text: row["simulation-name"] },
          { align: "center", text: row["simulation-owner-name"] },
          { align: "center", text: row["simulation-run-mode"] },
          {
            align: "center",
            text: `${row["server-agent-ip-address"]}:${row["server-agent-listening-port-number"]}`,
          },
          { align: "center", text: `${row["api-server-ip-address"]}:${row["api-server-port-number"]}` },
        ],
      }));
    setRows(rows);
  }, [rowsServer, searchValue]);

  const variants = {
    values: simulationUsers.map((user) => ({
      text: user["full-name"],
      value: user["full-name"],
    })),
  };

  const variants1 = {
    values:
      simulations.map((simulation) => ({
        text: `${simulation["simulation-name"]} [${simulation["simulation-owner-name"]}]`,
        value: `${simulation["simulation-name"]} [${simulation["simulation-owner-name"]}]`,
      })) || [],
  };

  const [simulationOwnerFilter, setSimulationOwnerFilter] = useState<Filter>({
    index: 2,
    filters: [],
  });

  const [simulationNameFilters, setSimulationNameFilters] = useState<Filter>({
    index: 1,
    filters: [],
  });

  const clearAllFilters = () => {
    setSimulationOwnerFilter({ ...simulationOwnerFilter, filters: [] });
    setSimulationNameFilters({ ...simulationNameFilters, filters: [] });
  };

  const filterRows = (el: Row) => {
    if (simulationOwnerFilter.filters.length) {
      let availableFilter;

      for (let filter of simulationOwnerFilter.filters) {
        filter = filter.toLowerCase();
        const simulationOwner = simulationUsers.find((user) => user["full-name"].toLowerCase() === filter);

        if (
          simulationOwner &&
          simulationOwner["user-name"].toLowerCase() ===
            (el.cells[simulationOwnerFilter.index].text as string).toLowerCase?.()
        ) {
          availableFilter = true;
        }
      }

      if (!availableFilter) return false;
    }

    if (simulationNameFilters.filters.length) {
      let availableFilter;

      for (let filter of simulationNameFilters.filters) {
        filter = filter.toLowerCase();
        const simulation = simulations.find(
          (simulation) =>
            (simulation["simulation-name"] + " [" + simulation["simulation-owner-name"] + "]").toLowerCase() === filter,
        );

        if (
          simulation &&
          simulation["simulation-name"].toLowerCase() ===
            (el.cells[simulationNameFilters.index].text as string).toLowerCase?.() &&
          simulation["simulation-owner-name"].toLowerCase() ===
            (el.cells[simulationOwnerFilter.index].text as string).toLowerCase?.()
        ) {
          const isSimulationIdEqual = rowsServer.find(
            (row) => Number(row["simulation-id"]) === simulation["simulation-id"],
          );
          if (isSimulationIdEqual) {
            availableFilter = true;
          }
        }
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const selectedLength = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionServerNodes = (action: (props: Required<GetServerNodesServerProps>) => any) => () => {
    const checkedRows = rows.filter(filterRows).filter((row) => row.checked);
    checkedRows.forEach((row) => dispatch(action({ "simulation-server-node-id": row.id as number })));
  };

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search server node" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddSimulationWrapper>
          <NavLink to={`${pages.createServerNode()}`}>
            <Button color="blue" size="small">
              Add new simulation server node
            </Button>
          </NavLink>
        </AddSimulationWrapper>
      </TableHeader>
      <TableBody>
        {!isLoading ? (
          <>
            <Filters>
              <TableFilter
                text="Simulation Owner"
                filters={simulationOwnerFilter.filters}
                variants={variants}
                setFilters={setSimulationOwnerFilter}
              />
              <TableFilter
                text="Simulation"
                filters={simulationNameFilters.filters}
                variants={variants1}
                setFilters={setSimulationNameFilters}
              />
            </Filters>
            <ActiveFilters>
              {simulationOwnerFilter.filters.map((filter) => (
                <ActiveFilter key={simulationOwnerFilter.index + filter}>
                  {filter}
                  <CloseBtn
                    onClick={() =>
                      setSimulationOwnerFilter({
                        ...simulationOwnerFilter,
                        filters: [...simulationOwnerFilter.filters].filter(
                          (statusFilter) => statusFilter !== filter,
                        ) as string[],
                      })
                    }
                  />
                </ActiveFilter>
              ))}
              {simulationNameFilters.filters.map((filter) => (
                <ActiveFilter key={simulationNameFilters.index + filter}>
                  {filter}
                  <CloseBtn
                    onClick={() =>
                      setSimulationNameFilters({
                        ...simulationNameFilters,
                        filters: [...simulationNameFilters.filters].filter(
                          (sessionFilter) => sessionFilter !== filter,
                        ) as string[],
                      })
                    }
                  />
                </ActiveFilter>
              ))}
              {simulationNameFilters.filters.length || simulationOwnerFilter.filters.length ? (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              ) : null}
            </ActiveFilters>
            <CheckboxTable
              rows={rows.filter(filterRows)}
              headers={headers}
              handleCheckAll={handleCheckAll}
              handleCheck={handleCheck}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              sortColIndex={sortColIndex.colIndex}
              setSortColIndex={setSortColIndex}
              sortDirection={sortColIndex.direction}
            />
          </>
        ) : (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        )}
        {!!selectedLength.length && (
          <FooterActions>
            <SelectedCount>{selectedLength.length} Item Selected</SelectedCount>
            <Buttons>
              <Button color="blue" onClick={handleActionServerNodes(duplicateServerNodeServer)}>
                Duplicate selected simulation server nodes
              </Button>
              <Button color="red" onClick={handleActionServerNodes(deleteServerNodeServer)}>
                Delete selected simulation server nodes
              </Button>
            </Buttons>
          </FooterActions>
        )}
      </TableBody>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  background: theme.palette.main[500],
  borderRadius: "9px",
  overflow: "hidden",
  width: "100%",
}));

const SearchWrapper = styled("div")(({ theme }) => ({
  maxWidth: "330px",
  width: "100%",
  position: "relative",

  svg: {
    position: "absolute",
    left: "12px",
    top: "12px",
  },

  ".MuiInputBase-input": {
    padding: "0 30px !important",
    height: "36px",
    fontSize: theme.typography.subtitle1.fontSize,
    color: theme.palette.main[100],

    "&::placeholder": {
      fontSize: theme.typography.subtitle1.fontSize,
      color: theme.palette.main[200],
    },
  },
}));

const TableHeader = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#141414",
  padding: "16px 24px",
}));

const TableBody = styled("div")({
  padding: "0 24px 20px",
});

const Filters = styled("div")({
  display: "flex",
  gap: "12px",
  margin: "25px 0 10px",

  ".MuiButtonBase-root": {
    minWidth: "auto",
    borderRadius: "6px",
  },
});

const AddSimulationWrapper = styled("div")(({ theme }) => ({
  ".MuiButtonBase-root": {
    padding: "16px",
    fontSize: theme.typography.subtitle1.fontSize,

    ".MuiTypography-root": {
      color: theme.palette.additional[200],
    },
  },
}));

const ActiveFilters = styled("div")({
  display: "flex",
  gap: "4px",
  flexWrap: "wrap",
  marginBottom: "16px",
});

const ActiveFilter = styled(Typography)(({ theme }) => ({
  padding: "7px 36px 7px 16px",
  backgroundColor: theme.palette.additional[700],
  borderRadius: "20px",
  position: "relative",
}));

const CloseBtn = styled("div")(({ theme }) => ({
  width: "9px",
  height: "9px",
  position: "absolute",
  right: "10px",
  top: "8px",
  cursor: "pointer",

  "&:before, &:after": {
    content: "''",
    width: "2px",
    height: "9px",
    borderRadius: "2px",
    backgroundColor: theme.palette.main[400],
    display: "block",
    position: "absolute",
  },

  "&:before": {
    transform: "rotate(45deg)",
    top: "5px",
  },

  "&:after": {
    transform: "rotate(-45deg)",
    top: "5px",
  },
}));

const FooterActions = styled("div")(({ theme }) => ({
  background: theme.palette.grey[500],
  position: "absolute",
  right: 0,
  bottom: 0,
  width: "100%",
  padding: "30px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const SelectedCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[100],
}));

const Buttons = styled("div")(() => ({
  display: "flex",
  gap: "20px",

  ".MuiButtonBase-root": {
    maxWidth: "none",
  },
}));

export default withSimulation(ServerNodesList);
