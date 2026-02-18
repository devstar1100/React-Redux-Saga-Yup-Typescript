import { ChangeEvent, useEffect, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { searchMatch } from "../../lib/searchMatch";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import { getAreSimulationsLoading, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { pages } from "../../lib/routeUtils";
import { Simulation } from "../../types/simulations";
import { getMonteCarloFilesServer, manageMonteCarloFileServer } from "../../redux/actions/monteCarloFilesActions";
import { getCurrentMonteCarloFiles, getIsMonteCarloFilesLoading } from "../../redux/reducers/monteCarloFilesReducer";
import { MonteCarloFile } from "../../types/monteCarloFile";
import { formatMonteCarloFileRow } from "./lib/rowMapper";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs/Input";
import Button from "../../components/Button/Button";
import TableFilter from "../../components/TableFilter/TableFilter";
import SearchIcon from "../../components/Icons/SearchIcon";
import PageLoader from "../../components/PageLoader/PageLoader";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";

interface FilterVariantValue {
  text: string;
  value: string;
}

interface FilterVariant {
  values: FilterVariantValue[];
}

interface MonteCarloFilesVariants {
  simulationNameVariants: FilterVariant;
}

const MonteCarloFilesList = () => {
  const dispatch = useDispatch();

  const monteCarloFilesServerLoading = useSelector(getIsMonteCarloFilesLoading);
  const simulationsServerLoading = useSelector(getAreSimulationsLoading);
  const simulationListServer: Simulation[] = useSelector(getSimulations);
  const monteCarloFilesServer: MonteCarloFile[] = useSelector(getCurrentMonteCarloFiles);

  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });

  const [simulationNameFilters, setSimulationNameFilters] = useState<Filter>({
    index: 1,
    filters: [],
  });

  const [filterVariants, setFilterVariants] = useState<MonteCarloFilesVariants>({
    simulationNameVariants: {
      values: [],
    },
  });

  const addSimulationNameToRowsServer = (
    simulationListServer: Simulation[],
    monteCarloFilesServer: MonteCarloFile[],
  ) => {
    return monteCarloFilesServer.map((row) => {
      const simulation = simulationListServer.find((item) => item["simulation-id"] === row["simulation-id"]);
      if (!simulation) return row;
      return {
        ...row,
        "simulation-name": simulation["simulation-name"],
        id: JSON.stringify({ simulationId: row["simulation-id"], name: row.name }),
      };
    });
  };

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

  const filterRows = (item: Row) => {
    if (
      searchValue &&
      !searchMatch(item.cells[0].text as string, searchValue) &&
      !searchMatch(item.cells[1].text as string, searchValue)
    )
      return false;

    if (simulationNameFilters.filters.length) {
      let availableFilter;

      for (let filter of simulationNameFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (item.cells[simulationNameFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const selectedTableElements = rows.filter(filterRows).filter((item) => item.checked);

  const handleActionMonteCarloFiles = (ActionType: "clone" | "delete") => {
    selectedTableElements.forEach((row) =>
      dispatch(
        manageMonteCarloFileServer({
          "action-type": ActionType,
          "simulation-id": JSON.parse(row.id as string).simulationId,
          "file-name": JSON.parse(row.id as string).name,
        }),
      ),
    );
  };

  const clearAllFilters = () => {
    setSimulationNameFilters({ ...simulationNameFilters, filters: [] });
  };

  useEffect(() => {
    dispatch(getSimulationsExtendedInfoServer({}));
    dispatch(getMonteCarloFilesServer());
  }, []);

  useEffect(() => {
    const rowsServer = addSimulationNameToRowsServer(simulationListServer, monteCarloFilesServer);
    const rows: Row[] = formatMonteCarloFileRow(rowsServer, navigate);
    setRows(rows);
    const simulationNames = rowsServer.map((simulation) => simulation["simulation-name"]);
    const simulationNameVariants = simulationNames.filter((value, index, self) => self.indexOf(value) === index);
    const newValues = simulationNameVariants.map((item) => ({
      text: item,
      value: item,
    }));
    setFilterVariants({
      simulationNameVariants: {
        values: newValues,
      },
    });
  }, [simulationListServer, monteCarloFilesServer]);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input
            placeholder="Search simulation name and file name"
            value={searchValue}
            handleChange={handleChange}
            fullWidth
          />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button color="blue" size="small" href={pages.addMonteCarloFile()}>
            Add New File
          </Button>
        </AddConfigurationWrapper>
      </TableHeader>
      <TableBody>
        {monteCarloFilesServerLoading || simulationsServerLoading ? (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        ) : (
          <>
            <Filters>
              <TableFilter
                text="simulation Name"
                filters={simulationNameFilters.filters}
                variants={filterVariants.simulationNameVariants}
                setFilters={setSimulationNameFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(simulationNameFilters, setSimulationNameFilters)}
              {hasAnyLength(simulationNameFilters) && (
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
              <Button color="blue" onClick={() => handleActionMonteCarloFiles("clone")}>
                Clone selected batches
              </Button>
              <Button color="red" onClick={() => handleActionMonteCarloFiles("delete")}>
                Delete selected batches
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
    text: "File Name",
    align: "center",
    filterable: true,
    width: 14,
  },
  {
    text: "Simulation Name",
    align: "center",
    filterable: true,
    width: 40,
  },
  {
    text: "Number of Inputs",
    align: "center",
    filterable: false,
    width: 14,
  },
  {
    text: "Number of Outputs",
    align: "center",
    filterable: false,
    width: 14,
  },
  {
    text: "View Inputs/Outputs List",
    align: "center",
    filterable: false,
    width: 18,
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

export default withSimulation(MonteCarloFilesList);
