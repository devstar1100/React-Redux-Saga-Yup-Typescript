import { ChangeEvent, useEffect, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { getAreSimulationsLoading, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { getMonteCarloBatchesListServer } from "../../redux/actions/monteCarloBatchesActions";
import { MonteCarloBatch } from "../../types/monteCarloBatches";
import { getAreMonteCarloBatchesLoading, getMonteCarloBatches } from "../../redux/reducers/monteCarloBatchesReducer";
import { Simulation } from "../../types/simulations";
import { formatMonteCarloBatchRow } from "./lib/RowMapper";
import { searchMatch } from "../../lib/searchMatch";
import Input from "../../components/Inputs";
import SearchIcon from "../../components/Icons/SearchIcon";
import TableFilter, { Value } from "../../components/TableFilter";
import PageLoader from "../../components/PageLoader";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable";
import withSimulation from "../../hocs/withSimulation";

const headers: Header[] = [
  {
    text: "Simulation Name",
    align: "center",
    filterable: true,
    width: 15.0,
  },
  {
    text: "Run Prefix",
    align: "center",
    filterable: true,
    width: 20.0,
  },
  {
    text: "Number of Runs ",
    align: "center",
    filterable: false,
    width: 20.0,
  },
  {
    text: "Maximum Execution Time",
    align: "center",
    filterable: false,
    width: 30.0,
  },
  {
    text: "Input/Output Parameters File",
    align: "center",
    filterable: false,
    width: 15.0,
  },
];

const MonteCarloBatchesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const batchServerLoading = useSelector(getAreMonteCarloBatchesLoading);
  const simulationsServerLoading = useSelector(getAreSimulationsLoading);
  const simulationListServer: Simulation[] = useSelector(getSimulations);
  const batchListServer: MonteCarloBatch[] = useSelector(getMonteCarloBatches);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });
  const [simulationNameFilter, setSimulationNameFilter] = useState<Filter>({ index: 0, filters: [] });

  const [filterVariants, setFilterVariants] = useState<Value[]>([]);

  const addSimulationNameToRowsServer = (
    simulationListServer: Simulation[],
    batchListServer: MonteCarloBatch[],
  ): MonteCarloBatch[] => {
    return batchListServer.map((row) => {
      const simulation = simulationListServer.find((item) => item["simulation-id"] === row["simulation-id"]);
      if (!simulation) return row;
      return {
        ...row,
        "simulation-name": simulation["simulation-name"],
      };
    });
  };

  const rowsPerPage = 10;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  const filterRows = (el: Row) => {
    if (searchValue && !searchMatch(el.cells[0].text as string, searchValue)) return false; ///search

    if (simulationNameFilter.filters.length) {
      let availableFilter;

      for (let filter of simulationNameFilter.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[0].text as string).toLowerCase?.()) {
          availableFilter = true;
          break;
        }
      }
      if (!availableFilter) return false;
    }
    return true;
  };

  const clearAllFilters = () => {
    setSimulationNameFilter({ index: 0, filters: [] });
  };

  useEffect(() => {
    dispatch(getSimulationsExtendedInfoServer({}));
    dispatch(getMonteCarloBatchesListServer());
  }, []);

  useEffect(() => {
    if (!simulationListServer.length) return;
    if (!batchListServer.length) return;
    const rowsServer = addSimulationNameToRowsServer(simulationListServer, batchListServer);
    const rows: Row[] = formatMonteCarloBatchRow(rowsServer, navigate);
    setRows(rows);
    const simulationNames = rowsServer.map((simulation) => simulation["simulation-name"]);
    const simulationNameVariants = simulationNames.filter((value, index, self) => self.indexOf(value) === index);

    setFilterVariants(simulationNameVariants.map((item) => ({ value: item, text: item })));
  }, [batchListServer, simulationListServer]);

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
        {batchServerLoading || simulationsServerLoading ? (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        ) : (
          <>
            <Filters>
              <TableFilter
                text="simulation Name"
                filters={simulationNameFilter.filters}
                variants={{ values: filterVariants }}
                setFilters={setSimulationNameFilter}
              />
            </Filters>
            <ActiveFilters>
              {getSelectedFilters(simulationNameFilter, setSimulationNameFilter)}
              {hasAnyLength(simulationNameFilter) && (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              )}
            </ActiveFilters>
            <CheckboxTable
              rows={rows.filter(filterRows)}
              headers={headers}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              sortColIndex={sortColIndex.colIndex}
              setSortColIndex={setSortColIndex}
              sortDirection={sortColIndex.direction}
            />
          </>
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

export default withSimulation(MonteCarloBatchesList);
