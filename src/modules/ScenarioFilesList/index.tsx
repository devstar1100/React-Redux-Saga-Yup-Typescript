import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router";

import withSimulation from "../../hocs/withSimulation";

import Input from "../../components/Inputs";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button";
import TableFilter from "../../components/TableFilter";
import CheckboxTable, { Header, Row, Sort } from "../../components/Tables/CheckboxTable";
import {
  GetConfigurationFilesServerProps,
  deleteConfigurationFileServer,
  getConfigurationFilesServer,
} from "../../redux/actions/configurationFilesActions";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getConfigurationFiles, getConfigurationFilesLoading } from "../../redux/reducers/configurationFilesReducer";
// import { formatConfigurationRow } from "./lib/configurationRowMapper";
import { searchMatch } from "../../lib/searchMatch";
import { pages } from "../../lib/routeUtils";
import PageLoader from "../../components/PageLoader";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import useTableFilter from "../../hooks/useTableFilter";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { formatScenarioRow } from "./lib/scenarioRowMapper";
import {
  ManageScenarioActionTypes,
  getScenarioFilesServer,
  manageScenarioFileServer,
} from "../../redux/actions/scenarioFilesActions";
import { getCurrentScenarioFiles, getIsScenarioFilesLoading } from "../../redux/reducers/scenarioFilesReducer";
import { getSimDependantPageFullLink } from "../../lib/simulationConfigurationUtils";

export interface FilterVariant {
  text: string;
  value: string;
}

export interface FilterVariants {
  values: FilterVariant[];
}

const ScenarioFilesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { simulationId: simIdStr, sessionId: sessionIdStr } = useParams();

  const simulationId = Number(simIdStr);
  const sessionId = Number(sessionIdStr);

  const rowsServer = useSelector(getCurrentScenarioFiles);
  const isLoading = useSelector(getIsScenarioFilesLoading);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 1,
    direction: "top",
  });

  const [simulationNameFilters, simulationNameVariants, setSimulationNameFilters, setSimulationNameVariants] =
    useTableFilter({
      tableColIndex: 1,
    });

  const [simulationOwnerFilters, simulationOwnerVariants, setSimulationOwnerFilters, setSimulationOwnerVariants] =
    useTableFilter({
      tableColIndex: 2,
    });

  const simulationOwnerNames = getUniqSelectItems(rowsServer, "simulation-owner-name");

  const simulationNames = useMemo(() => {
    const modifiedRows = rowsServer.map((el) => {
      const computedValue = `${el["simulation-name"]} [${el["simulation-owner-name"]}]`;
      return { computedValue };
    });

    return getUniqSelectItems(modifiedRows, "computedValue");
  }, [rowsServer]);

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
    const isOneFieldMatch =
      searchMatch(el.cells[0].text as string, searchValue) ||
      searchMatch(el.cells[1].text as string, searchValue) ||
      searchMatch(el.cells[2].text as string, searchValue);
    if (searchValue && !isOneFieldMatch) return false;

    if (simulationOwnerFilters.filters.length) {
      let availableFilter;

      for (let filter of simulationOwnerFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[simulationOwnerFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (simulationNameFilters.filters.length) {
      let availableFilter;

      for (let filter of simulationNameFilters.filters) {
        const regex = /\s*\[(.*?)\]\s*/;
        // Name [owner name] => ["[owner name]", "owner name"]
        const match = regex.exec(filter.toLowerCase());
        if (!match) return false;

        // Name [owner name] => "Name"
        const nameFilter = filter.toLowerCase().replace(/\s*\[.*?\]\s*/g, "");
        const isNameMatch = nameFilter == (el.cells[simulationNameFilters.index].text as string).toLowerCase?.();
        const ownerFilter = match[1];
        // index is column(filter name), index + 1 is hardcode owner column index
        const isOwnerMatch = ownerFilter == (el.cells[simulationNameFilters.index + 1].text as string).toLowerCase?.();
        if (isNameMatch && isOwnerMatch) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionScenarioFiles = (actionType: ManageScenarioActionTypes) => () => {
    selectedTableElements.forEach((row) =>
      dispatch(manageScenarioFileServer({ actionType, scenarioFileId: row.id as number })),
    );
  };

  const clearAllFilters = () => {
    setSimulationOwnerFilters({ ...simulationOwnerFilters, filters: [] });
    setSimulationNameFilters({ ...simulationNameFilters, filters: [] });
  };

  useEffect(() => {
    dispatch(getScenarioFilesServer());
  }, []);

  useEffect(() => {
    if (!rowsServer) return;
    const rows = formatScenarioRow(rowsServer, navigate, simulationId, sessionId);

    setSimulationNameVariants({
      values: simulationOwnerNames.map((el) => ({
        text: el,
        value: el,
      })),
    });

    setSimulationOwnerVariants({
      values: simulationNames.map((el) => ({
        text: el,
        value: el,
      })),
    });

    setRows(rows);
  }, [rowsServer]);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search scenario file" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button
            color="blue"
            size="small"
            href={getSimDependantPageFullLink({ baseRoute: pages.createScenarioFile(), simulationId, sessionId })}
          >
            Add new scenario file
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
                text="Simulation Owner"
                filters={simulationOwnerFilters.filters}
                variants={simulationNameVariants}
                setFilters={setSimulationOwnerFilters}
              />
              <TableFilter
                text="Simulation Name"
                filters={simulationNameFilters.filters}
                variants={simulationOwnerVariants}
                setFilters={setSimulationNameFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(simulationOwnerFilters, setSimulationOwnerFilters)}
              {getSelectedFilters(simulationNameFilters, setSimulationNameFilters)}
              {hasAnyLength(simulationOwnerFilters, simulationNameFilters) && (
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
              <Button color="blue" onClick={handleActionScenarioFiles("clone")}>
                Duplicate selected scenario file
              </Button>
              <Button color="red" onClick={handleActionScenarioFiles("delete")}>
                Delete selected scenario file
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
    text: "Scenario file name",
    align: "center",
    filterable: true,
    width: 16.66,
  },
  {
    text: "Simulation Name",
    align: "center",
    filterable: true,
    width: 11.54,
  },
  {
    text: "Simulation Owner",
    align: "center",
    filterable: true,
    width: 14.57,
  },
  {
    text: "Number of events",
    align: "center",
    filterable: false,
    width: 20.634,
  },
  {
    text: "Number of lines",
    align: "center",
    filterable: false,
    width: 18.412,
  },
  {
    text: "Scenario actions",
    align: "center",
    filterable: false,
    width: 18.412,
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

export default withSimulation(ScenarioFilesList);
