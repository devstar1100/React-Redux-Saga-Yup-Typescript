import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate } from "react-router";

import withSimulation from "../../hocs/withSimulation";

import Input from "../../components/Inputs/Input";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button/Button";
import TableFilter from "../../components/TableFilter/TableFilter";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { searchMatch } from "../../lib/searchMatch";
import PageLoader from "../../components/PageLoader/PageLoader";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import { formatSimulationRow } from "./lib/simulationRowMapper";
import { getAreSimulationsLoading, getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { cloneSimulationServer, deleteSimulationServer } from "../../redux/actions/simulationActions";
import { Simulation } from "../../types/simulations";
import { pages } from "../../lib/routeUtils";
import useTableFilter from "../../hooks/useTableFilter";
import { getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { SimulationUser } from "../../types/simulationUser";
import { getSimulationUsersServer } from "../../redux/actions/simulationUsersActions";
import { getIsHydrated } from "../../redux/reducers/appReducer";
import { getMonteCarloBatchesListServer } from "../../redux/actions/MonteCarloBatchesActions";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import { getMonteCarloBatches } from "../../redux/reducers/monteCarloBatchesReducer";
import { log } from "node:console";

interface FilterVariantValue {
  text: string;
  value: string;
}

interface FilterVariant {
  values: FilterVariantValue[];
}

interface SimulationVariants {
  statusVariants: FilterVariant;
  projectVariants: FilterVariant;
}

const MonteCarloBach = () => {
  const dispatch = useDispatch();

  const rowsServer = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);
  const isLoading = useSelector(getAreSimulationsLoading);
  const simulationUsers: SimulationUser[] = useSelector(getSimulationUsers);
  const monteCarloBatchesServer: MonteCarloBatch[] = useSelector(getMonteCarloBatches);
  console.log("monteCarloBatches", monteCarloBatchesServer);
  const isHydrated = useSelector(getIsHydrated);

  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });

  const [simulationOwnerFilters, simulationOwnerVariants, setSimulationOwnerFilters, setSimulationOwnerVariants] =
    useTableFilter({
      tableColIndex: 2,
    });

  const [statusFilters, setStatusFilters] = useState<Filter>({
    index: 3,
    filters: [],
  });

  const [projectFilters, setProjectFilters] = useState<Filter>({
    index: 1,
    filters: [],
  });

  const [filterVariants, setFilterVariants] = useState<SimulationVariants>({
    statusVariants: {
      values: [],
    },
    projectVariants: {
      values: [],
    },
  });

  const simulationOwners = simulationUsers.map((user) => user["user-name"]);

  useEffect(() => {
    if (isHydrated) {
      dispatch(getSimulationUsersServer({}));
    }
  }, [isHydrated]);

  const rowsPerPage = 10;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

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

  const filterRows = (el: Row) => {
    if (searchValue && !searchMatch(el.cells[0].text as string, searchValue)) return false;

    if (projectFilters.filters.length) {
      let availableFilter;

      for (let filter of projectFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[projectFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (simulationOwnerFilters.filters.length) {
      let availableFilter;

      for (let filter of simulationOwnerFilters.filters) {
        const ownerFilter = filter;
        const a = ownerFilter;
        const b = (el.cells[2].text as string).toLowerCase?.();

        const isOwnerMatch = a === b;
        if (isOwnerMatch) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionCustomViews = (action: (props: Pick<Simulation, "simulation-id">) => any) => () => {
    selectedTableElements.forEach((row) => dispatch(action({ "simulation-id": row.id as number })));
  };

  const handleCloneSimulations = () => {
    selectedTableElements.forEach((row) => {
      const simulation = rowsServer.find((el) => el["simulation-id"] === row.id);
      dispatch(cloneSimulationServer({ ...(simulation as Simulation) }));
    });
  };

  const clearAllFilters = () => {
    setStatusFilters({ ...statusFilters, filters: [] });
    setProjectFilters({ ...projectFilters, filters: [] });
  };

  const getEnumeratorValues = (key: string) => {
    const values = enumerators
      .find((el) => el["enum-type"] === key)
      ?.["enum-values"].map((value) => ({
        text: value["enum-value-string"],
        value: value["enum-value-string"],
      })) as FilterVariantValue[];

    return values || [];
  };

  useEffect(() => {
    dispatch(getSimulationsExtendedInfoServer({}));
    dispatch(getEnumeratorsServer());
    dispatch(getMonteCarloBatchesListServer());
  }, []);

  useEffect(() => {
    if (!monteCarloBatchesServer) return;
    const rows: Row[] = formatSimulationRow(rowsServer, navigate, statusFilters);

    const newValues = simulationOwners.map((el) => ({
      text: el,
      value: el,
    }));

    setSimulationOwnerVariants({
      values: newValues,
    });

    setRows(rows);
  }, [monteCarloBatchesServer, statusFilters]);

  useEffect(() => {
    if (!enumerators) return;

    const statusVariants = getEnumeratorValues("simulation-statuses");
    const projectVariants = getEnumeratorValues("projects");

    setFilterVariants({
      statusVariants: {
        values: statusVariants,
      },
      projectVariants: {
        values: projectVariants,
      },
    });
  }, [enumerators]);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search configuration" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button color="blue" size="small" href={pages.createSimulation()}>
            Add New Batch
          </Button>
        </AddConfigurationWrapper>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        ) : (
          <>
            <Filters>
              <TableFilter
                text="simulation Name"
                filters={statusFilters.filters}
                variants={filterVariants.statusVariants}
                setFilters={setStatusFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(statusFilters, setStatusFilters)}
              {getSelectedFilters(projectFilters, setProjectFilters)}
              {getSelectedFilters(simulationOwnerFilters, setSimulationOwnerFilters)}
              {hasAnyLength(statusFilters, projectFilters, simulationOwnerFilters) && (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              )}
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
        )}
        {!!selectedTableElements.length && (
          <FooterActions>
            <SelectedCount>{selectedTableElements.length} Item Selected</SelectedCount>
            <Buttons>
              <Button color="blue" onClick={handleCloneSimulations}>
                Clone selected simulation
              </Button>
              <Button color="red" onClick={handleActionCustomViews(deleteSimulationServer)}>
                Delete selected simulations
              </Button>
            </Buttons>
          </FooterActions>
        )}
      </TableBody>
    </Wrapper>
  );
};

const headers: Header[] = [
  {
    text: "Simulation name",
    align: "center",
    filterable: true,
    width: 14,
  },
  {
    text: "Run Prefix",
    align: "center",
    filterable: true,
    width: 14,
  },
  {
    text: "Number of Runs",
    align: "center",
    filterable: true,
    width: 14,
  },
  {
    text: "Maximum Execution Time",
    align: "center",
    filterable: false,
    width: 44,
  },
  {
    text: "Input/Output Parameters File",
    align: "center",
    filterable: false,
    width: 14,
  },
];

const Wrapper = styled("div")(({ theme }) => ({
  background: theme.palette.main[500],
  borderRadius: "9px",
  overflow: "hidden",
  width: "100%",
}));

const TableHeader = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#141414",
  padding: "16px 24px",
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

const AddConfigurationWrapper = styled("div")(({ theme }) => ({
  ".MuiButtonBase-root": {
    padding: "16px",
    fontSize: theme.typography.subtitle1.fontSize,

    ".MuiTypography-root": {
      color: theme.palette.additional[200],
    },
  },
}));

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

const TableBody = styled("div")({
  padding: "0 24px 20px",
});

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
}));

export default withSimulation(MonteCarloBach);
