import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router";

import withSimulation from "../../hocs/withSimulation";

import Input from "../../components/Inputs/Input";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button/Button";
import TableFilter from "../../components/TableFilter/TableFilter";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";
import { useDispatch, useSelector } from "react-redux";
import { searchMatch } from "../../lib/searchMatch";
import PageLoader from "../../components/PageLoader/PageLoader";
import { getSelectedFilters } from "../../lib/tableFilterHelpers";
import { getSimulations, getEnumerators } from "../../redux/reducers/simulationsReducer";
import { getSimulationsExtendedInfoServer, getEnumeratorsServer } from "../../redux/actions/simulationsActions";
import { Simulation } from "../../types/simulations";
import {
  getSimulatedSystemsAlertData,
  getSimulatedSystemsLoading,
  getStoredSimulatedSystems,
} from "../../redux/reducers/simulatedSystemsReducer";
import {
  addSimulatedSystemServer,
  cloneSimulatedSystemServer,
  deleteSimulatedSystemServer,
  fetchSimulatedSystemsServer,
  setSimulatedSystemsAlertData,
} from "../../redux/actions/simulatedSystemsActions";
import { formatSimulatedSystemsRow } from "./lib/simulatedSystemsRowMap";
import { pages } from "../../lib/routeUtils";
import { getSelectedSimulationName } from "../../redux/reducers/selectedSimulationReducer";
import { updateSelectedSimulationName } from "../../redux/actions/selectedSimulationActions";
import Alert, { AlertVariant } from "../../components/Alert/Alert";

const headers: Header[] = [
  {
    text: "System Name",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Simulation name",
    align: "center",
    filterable: true,
    width: 17,
  },
  {
    text: "System type",
    align: "center",
    filterable: true,
    width: 18,
  },
  {
    text: "System class",
    align: "center",
    filterable: true,
    width: 15,
  },
  {
    text: "System alias",
    align: "center",
    filterable: true,
    width: 15,
  },
  {
    text: "# of child models",
    align: "center",
    filterable: true,
    width: 10,
  },
];

interface FilterVariantValue {
  text: string;
  value: string | number;
}

interface FilterVariant {
  values: FilterVariantValue[];
}

interface SimulationVariants {
  simulationNameVariants: FilterVariant;
}

const ROWS_PER_PAGE = 10 as const;

const SimulatedSystemsList = () => {
  const dispatch = useDispatch();

  const rowsServer = useSelector(getStoredSimulatedSystems);
  const isLoading = useSelector(getSimulatedSystemsLoading);
  const simulations = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);
  const storedSimulationName = useSelector(getSelectedSimulationName);
  const simulatedSystemsAlertData = useSelector(getSimulatedSystemsAlertData);

  const navigate = useNavigate();
  const { simulationName } = useParams();

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

  const [filterVariants, setFilterVariants] = useState<SimulationVariants>({
    simulationNameVariants: {
      values: [],
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    resetAlert();
    setSearchValue(e.target.value);
  };

  const handleCheckAll = (status: boolean) => () => {
    const checkedRows = rows.map((row, index) => {
      if (index >= page * ROWS_PER_PAGE - ROWS_PER_PAGE && index < page * ROWS_PER_PAGE) {
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
      searchMatch(el.cells[2].text as string, searchValue) ||
      searchMatch(el.cells[3].text as string, searchValue);

    if (searchValue && !isOneFieldMatch) return false;

    return true;
  };

  const resetAlert = () =>
    dispatch(
      setSimulatedSystemsAlertData({
        isVisible: false,
        text: "",
      }),
    );

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionButtonClick = (action: (props: { "simulation-name": string; "model-id": number }) => any) => () => {
    selectedTableElements.forEach((row) =>
      dispatch(action({ "model-id": row.id as number, "simulation-name": row.cells[1].text as string })),
    );
  };

  const getSimulatiosNamesVariants = (simulations: Simulation[]) => {
    const values = simulations.map((item) => ({
      text: item["simulation-name"],
      value: item["simulation-name"],
    })) as FilterVariantValue[];

    return values;
  };

  useEffect(() => {
    dispatch(getSimulationsExtendedInfoServer({}));
    dispatch(getEnumeratorsServer());

    return () => {
      resetAlert();
    };
  }, []);

  useEffect(() => {
    if (!simulations.length) return;

    const defaultSimName =
      simulations.find(
        (sim) => sim["simulation-name"] === simulationName || sim["simulation-name"] === storedSimulationName,
      )?.["simulation-name"] || simulations[0]["simulation-name"];

    dispatch(fetchSimulatedSystemsServer({ "simulation-name": defaultSimName }));
    setFilterVariants({
      simulationNameVariants: { values: getSimulatiosNamesVariants(simulations) },
    });

    setSimulationNameFilters({
      ...simulationNameFilters,
      filters: [defaultSimName],
    });
  }, [simulations, simulationName]);

  useEffect(() => {
    if (!rowsServer || !enumerators) return;
    const rows: Row[] = formatSimulatedSystemsRow({ rows: rowsServer, navigate, simulations, enumerators });

    setRows(rows);
  }, [rowsServer, enumerators]);

  useEffect(() => {
    if (!simulationNameFilters.filters.length) return;
    const simName = simulationNameFilters.filters[0];

    if (simName !== storedSimulationName) {
      resetAlert();
    }

    dispatch(fetchSimulatedSystemsServer({ "simulation-name": simName }));
    navigate(pages.simulatedSystems(simName), { replace: true });
    dispatch(updateSelectedSimulationName(simName));
  }, [simulationNameFilters]);

  const handleCreateSimulatedSystemClick = () => {
    navigate(`${pages.createSimulatedSystem()}/${simulationNameFilters.filters[0]}`);
  };

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search configuration" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button color="blue" size="small" onClick={handleCreateSimulatedSystemClick}>
            Add new simulated system
          </Button>
        </AddConfigurationWrapper>
      </TableHeader>
      <TableBody>
        <>
          <Filters>
            <TableFilter
              text="Simulation Name"
              filters={simulationNameFilters.filters}
              variants={filterVariants.simulationNameVariants}
              setFilters={setSimulationNameFilters}
              handleChangeFilter={resetAlert}
              multiple={false}
            />
          </Filters>

          <ActiveFilters>
            {getSelectedFilters(simulationNameFilters)}
            {/* {hasAnyLength(simulationNameFilters) && (
              <ActiveFilter>
                Clear all filters <CloseBtn onClick={clearAllFilters} />
              </ActiveFilter>
            )} */}
          </ActiveFilters>

          {simulatedSystemsAlertData.isVisible && (
            <Alert variant={AlertVariant.success} title={simulatedSystemsAlertData.text} />
          )}

          {isLoading ? (
            <Box p="100px 0">
              <PageLoader />
            </Box>
          ) : (
            <CheckboxTable
              rows={rows.filter(filterRows)}
              headers={headers}
              handleCheckAll={handleCheckAll}
              handleCheck={handleCheck}
              page={page}
              setPage={setPage}
              rowsPerPage={ROWS_PER_PAGE}
              sortColIndex={sortColIndex.colIndex}
              setSortColIndex={setSortColIndex}
              sortDirection={sortColIndex.direction}
            />
          )}
        </>
        {!!selectedTableElements.length && (
          <FooterActions>
            <SelectedCount>{selectedTableElements.length} Item Selected</SelectedCount>
            <Buttons>
              <Button color="blue" onClick={handleActionButtonClick(cloneSimulatedSystemServer)}>
                Duplicate simulated systems
              </Button>
              <Button color="red" onClick={handleActionButtonClick(deleteSimulatedSystemServer)}>
                Delete selected simulated systems
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

export default withSimulation(SimulatedSystemsList);
