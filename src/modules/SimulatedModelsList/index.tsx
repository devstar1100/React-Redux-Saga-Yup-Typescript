import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router";

import withSimulation from "../../hocs/withSimulation";

import Input from "../../components/Inputs";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button";
import TableFilter from "../../components/TableFilter";
import CheckboxTable, { Header, Row, Sort } from "../../components/Tables/CheckboxTable";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { formatSimulatedModelRow } from "./lib/simulatedModelRowMapper";
import { searchMatch } from "../../lib/searchMatch";
import { pages } from "../../lib/routeUtils";
import PageLoader from "../../components/PageLoader";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import useTableFilter from "../../hooks/useTableFilter";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import {
  InteractSimulatedModelServerProps,
  ManageSimulatedModelsServerProps,
  deleteSimulatedModelsServer,
  duplicateSimulatedModelsServer,
  getSimulatedModelsServer,
  updateSimulatedModelAlertData,
} from "../../redux/actions/simulatedModelsActions";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import {
  getIsSimulatedModelsLoading,
  getSimulatedModelAlertData,
  getSimulatedModels,
} from "../../redux/reducers/simulatedModelsReducer";
import { fetchSimulatedSystemsServer } from "../../redux/actions/simulatedSystemsActions";
import { getStoredSimulatedSystems } from "../../redux/reducers/simulatedSystemsReducer";
import { getSelectedSimulationName } from "../../redux/reducers/selectedSimulationReducer";
import { updateSelectedSimulationName } from "../../redux/actions/selectedSimulationActions";
import Alert, { AlertVariant } from "../../components/Alert";

export interface FilterVariant {
  text: string;
  value: string;
}

export interface FilterVariants {
  values: FilterVariant[];
}

const SimulatedModelsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { simulationName } = useParams();

  const rowsServer = useSelector(getSimulatedModels) || [];
  const simulatedSystems = useSelector(getStoredSimulatedSystems) || [];
  const simulations = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);
  const isLoading = useSelector(getIsSimulatedModelsLoading);
  const storedSimulationName = useSelector(getSelectedSimulationName);
  const successAlertData = useSelector(getSimulatedModelAlertData);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });

  const executionFrequencies = enumerators.find((enumerator) => enumerator["enum-type"] === "execution-frequencies");
  const modelSources = enumerators.find((enumerator) => enumerator["enum-type"] === "model-source");
  const highLevelModels = enumerators.find((enumerator) => enumerator["enum-type"] === "high-level-models");

  const [simulationNameFilters, simulationNameVariants, setSimulationNameFilters, setSimulationNameVariants] =
    useTableFilter({
      tableColIndex: 1,
    });

  const [parentSystemFilters, parentSystemVariants, setParentSystemFilters, setParentSystemVariants] = useTableFilter({
    tableColIndex: 3,
  });

  const rowsPerPage = 10;

  const simulatedModelsNames = useMemo(() => getUniqSelectItems(simulations, "simulation-name"), [simulations]);

  const simulatedModelsClassNames = useMemo(
    () => getUniqSelectItems(simulatedSystems, "model-class-name"),
    [simulatedSystems],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    resetAlert();
    setSearchValue(e.target.value);
  };

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
      searchMatch(el.cells[3].text as string, searchValue) ||
      searchMatch(el.cells[4].text as string, searchValue);

    if (searchValue && !isOneFieldMatch) return false;

    if (parentSystemFilters.filters.length) {
      let availableFilter;
      const parentSystemId = rowsServer.find((row) => row["model-id"] === el.id)?.["parent-system-id"];

      for (let filter of parentSystemFilters.filters) {
        const systemId = simulatedSystems.find((sys) => sys["model-class-name"] === filter)?.["model-id"];
        filter = filter.toLowerCase();

        if (parentSystemId && systemId && parentSystemId === systemId) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionSimulatedModels = (action: (props: Required<InteractSimulatedModelServerProps>) => any) => () => {
    selectedTableElements.forEach((row) =>
      dispatch(
        action({
          modelId: +row.id,
          simulationName: simulationNameFilters.filters[0],
          refetch: () => {
            const simulationName = simulationNameFilters.filters[0];

            dispatch(
              getSimulatedModelsServer({
                simulationName,
              }),
            );
          },
        }),
      ),
    );
  };

  const resetAlert = () =>
    dispatch(
      updateSimulatedModelAlertData({
        isVisible: false,
        text: "",
      }),
    );

  const clearAllFilters = () => {
    setParentSystemFilters({ ...parentSystemFilters, filters: [] });
  };

  useEffect(() => {
    dispatch(getEnumeratorsServer());
    dispatch(getSimulationsServer({}));

    return () => {
      resetAlert();
    };
  }, []);

  useEffect(() => {
    const rows = formatSimulatedModelRow(rowsServer, navigate, executionFrequencies, modelSources, highLevelModels);

    setSimulationNameVariants({
      values: simulatedModelsNames.map((el) => ({
        text: el,
        value: el,
      })),
    });

    if (simulatedModelsNames.length) {
      const defaultSimName =
        simulatedModelsNames.find((sim) => sim === simulationName || sim === storedSimulationName) ||
        simulatedModelsNames[0];

      setSimulationNameFilters((prev) => ({
        ...prev,
        filters: prev.filters.length ? prev.filters : [defaultSimName],
      }));
    }

    setParentSystemVariants({
      values: simulatedModelsClassNames.map((el) => ({
        text: el,
        value: el,
      })),
    });

    setRows(rows);
  }, [rowsServer, executionFrequencies, simulatedModelsClassNames, simulatedModelsNames]);

  useEffect(() => {
    if (!simulationNameFilters.filters.length) return;
    const simName = simulationNameFilters.filters[0];

    dispatch(
      getSimulatedModelsServer({
        simulationName: simName,
      }),
    );

    dispatch(
      fetchSimulatedSystemsServer({
        "simulation-name": simName,
      }),
    );

    navigate(pages.simulatedModelList(simName), { replace: true });
    dispatch(updateSelectedSimulationName(simName));
  }, [simulationNameFilters.filters]);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search simulated model" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button color="blue" size="small" href={`${pages.addSimulatedModel()}/${simulationName}`}>
            Add new simulated model
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
                text="Simulation Name"
                filters={simulationNameFilters.filters}
                variants={simulationNameVariants}
                setFilters={setSimulationNameFilters}
                handleChangeFilter={resetAlert}
                multiple={false}
              />
              <TableFilter
                text="Parent System"
                filters={parentSystemFilters.filters}
                variants={parentSystemVariants}
                handleChangeFilter={resetAlert}
                setFilters={setParentSystemFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(simulationNameFilters)}
              {getSelectedFilters(parentSystemFilters, setParentSystemFilters)}
              {hasAnyLength(parentSystemFilters) && (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              )}
            </ActiveFilters>

            {successAlertData.isVisible && <Alert variant={AlertVariant.success} title={successAlertData.text} />}

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
              <Button color="blue" onClick={handleActionSimulatedModels(duplicateSimulatedModelsServer)}>
                Duplicate selected simulated model
              </Button>
              <Button color="red" onClick={handleActionSimulatedModels(deleteSimulatedModelsServer)}>
                Delete selected simulated model
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
    text: "Model Name",
    align: "center",
    filterable: true,
    width: 25,
  },
  {
    text: "Model Source",
    align: "center",
    filterable: true,
    width: 12,
  },
  {
    text: "Model Type",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Model class",
    align: "center",
    filterable: true,
    width: 18,
  },
  {
    text: "Model Step Frequency",
    align: "center",
    filterable: false,
    width: 10,
  },
  {
    text: "# of inputs",
    align: "center",
    filterable: false,
    width: 6,
  },
  {
    text: "# of outputs",
    align: "center",
    filterable: false,
    width: 6,
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

  ".MuiButtonBase-root": {
    maxWidth: "none",
  },
}));

export default withSimulation(SimulatedModelsList);
