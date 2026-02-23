import { useState, ChangeEvent, useEffect, ReactElement } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Box, styled, Typography } from "@mui/material";

import withSimulation from "../../hocs/withSimulation";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable";
import { Simulation, SimulationActionType, SimulationSessionActionType } from "../../types/simulations";
import { getAreSimulationsLoading, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getIsHydrated } from "../../redux/reducers/appReducer";
import { getSimulationsServer } from "../../redux/actions/simulationsActions";
import { runSimulationActionServer, runSimulationSessionActionServer } from "../../redux/actions/simulationActions";
import { dateFormatWithTime } from "../../lib/dateFormat";
import { pages } from "../../lib/routeUtils";
import Input from "../../components/Inputs";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button";
import TableFilter from "../../components/TableFilter";
import PageLoader from "../../components/PageLoader";

const headers: Header[] = [
  {
    text: "Select simulation",
    align: "center",
    filterable: true,
    width: 15.0,
  },
  {
    text: "Simulation Configuration",
    align: "center",
    filterable: true,
    width: 20.0,
  },
  {
    text: "Simulation server node",
    align: "center",
    filterable: true,
    width: 20.0,
  },
  {
    text: "Attach to existing simulation session",
    align: "center",
    filterable: false,
    width: 30.0,
  },
  {
    text: "Start a new session",
    align: "center",
    filterable: false,
    width: 15.0,
  },
];

const TablePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const rowsServer: Simulation[] = useSelector(getSimulations);
  const isHydrated = useSelector(getIsHydrated);
  const isLoading = useSelector(getAreSimulationsLoading);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });
  const rowsPerPage = 10;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  useEffect(() => {
    if (isHydrated) {
      dispatch(
        getSimulationsServer({
          name: searchValue,
        }),
      );
    }
  }, [searchValue]);

  useEffect(() => {
    if (!rowsServer) return;
    const rows: Row[] = rowsServer.map((row) => ({
      id: row["simulation-id"],
      cells: [
        {
          align: "left",
          text: row["simulation-name"],
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () =>
            dispatch(
              runSimulationActionServer({
                "simulation-id": row["simulation-id"],
                "action-type": SimulationActionType.select,
                // redirect: () => navigate(pages.simulationDashboard() + "/" + row["simulation-id"]),
              }),
            ),
        },
        { align: "left", text: row["configuration-name"] },
        { align: "left", text: row["simulation-server-node-name"] },
        {
          align: "center",
          text: (row["active-simulation-sessions"] || []).map((session, index) => (
            <span
              key={`session_string-${session["simulation-session-id"]}`}
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() =>
                dispatch(
                  runSimulationSessionActionServer({
                    "simulation-session-id": session["simulation-session-id"],
                    "action-type": SimulationSessionActionType.attach,
                    redirect: () =>
                      navigate(
                        pages.simulationDashboard() +
                          "/" +
                          row["simulation-id"] +
                          "/" +
                          session["simulation-session-id"],
                      ),
                  }),
                )
              }
            >
              {session["simulation-session-details"]}
              {index < (row["active-simulation-sessions"] || []).length - 1 && ", "}
            </span>
          )),
        },
        {
          align: "center",
          text: "Start a new session",
          decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
          handler: () =>
            dispatch(
              runSimulationActionServer({
                "simulation-id": row["simulation-id"],
                "action-type": SimulationActionType.select,
                redirect: () => navigate(pages.simulationDashboard() + "/" + row["simulation-id"]),
              }),
            ),
        },
      ],
    }));
    setRows(rows);
  }, [rowsServer]);

  const variants = {
    values: [
      { text: "incomplete", value: "incomplete" },
      { text: "in-development", value: "in-development" },
      { text: "in-production", value: "in-production" },
      { text: "allow-to-delete", value: "allow-to-delete" },
    ],
  };

  const variants1 = {
    values: [
      { text: "Has active sessions", value: true },
      { text: "No active sessions", value: false },
    ],
  };

  const [statusFilters, setStatusFilters] = useState<Filter>({
    index: 1,
    filters: [],
  });

  const [sessionFilters, setSessionFilters] = useState<Filter>({
    index: 3,
    filters: [],
  });

  const clearAllFilters = () => {
    setStatusFilters({ ...statusFilters, filters: [] });
    setSessionFilters({ ...sessionFilters, filters: [] });
  };

  const filterRows = (el: Row) => {
    if (statusFilters.filters.length) {
      let availableFilter;

      for (let filter of statusFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[statusFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (sessionFilters.filters.length) {
      if (sessionFilters.filters.length === 2) return true;

      let availableFilter;

      for (let filter of sessionFilters.filters) {
        let filterValue = false;
        filter = filter.toLowerCase();

        if ((el.cells[sessionFilters.index].text as ReactElement[]).length) filterValue = true;
        if (variants1.values.find((variant) => variant.text.toLowerCase() === filter)?.value === filterValue)
          return true;
        else return false;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const filteredRows = rows.filter(filterRows);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input
            placeholder="Search by Id or by simulation name"
            value={searchValue}
            handleChange={handleChange}
            fullWidth
          />
          <SearchIcon />
        </SearchWrapper>
      </TableHeader>
      <TableBody>
        {!isLoading ? (
          <>
            <Filters>
              <TableFilter
                text="Status"
                filters={statusFilters.filters}
                variants={variants}
                setFilters={setStatusFilters}
              />
              <TableFilter
                text="Active Sessions"
                filters={sessionFilters.filters}
                variants={variants1}
                setFilters={setSessionFilters}
              />
            </Filters>
            <ActiveFilters>
              {statusFilters.filters.map((filter) => (
                <ActiveFilter key={statusFilters.index + filter}>
                  {filter}
                  <CloseBtn
                    onClick={() =>
                      setStatusFilters({
                        ...statusFilters,
                        filters: [...statusFilters.filters].filter(
                          (statusFilter) => statusFilter !== filter,
                        ) as string[],
                      })
                    }
                  />
                </ActiveFilter>
              ))}
              {sessionFilters.filters.map((filter) => (
                <ActiveFilter key={sessionFilters.index + filter}>
                  {filter}
                  <CloseBtn
                    onClick={() =>
                      setSessionFilters({
                        ...sessionFilters,
                        filters: [...sessionFilters.filters].filter(
                          (sessionFilter) => sessionFilter !== filter,
                        ) as string[],
                      })
                    }
                  />
                </ActiveFilter>
              ))}
              {sessionFilters.filters.length || statusFilters.filters.length ? (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              ) : null}
            </ActiveFilters>
            <CheckboxTable
              rows={filteredRows}
              headers={headers}
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

export default withSimulation(TablePage);
