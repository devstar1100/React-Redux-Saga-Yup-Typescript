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
import { searchMatch } from "../../lib/searchMatch";
import { pages } from "../../lib/routeUtils";
import PageLoader from "../../components/PageLoader";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import useTableFilter from "../../hooks/useTableFilter";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { getSimulatedModelsServer } from "../../redux/actions/simulatedModelsActions";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { getIsSimulatedModelsLoading, getSimulatedModels } from "../../redux/reducers/simulatedModelsReducer";
import {
  ManageModelOutputServerProps,
  cloneModelOutputServer,
  deleteModelOutputServer,
  fetchModelOutputsListServer,
  updateModelOutputAlertData,
} from "../../redux/actions/modelOutputsActions";
import { getModelOutputsAlertData, getStoredModelOutputs } from "../../redux/reducers/modelOutputsReducer";
import { formatModelOutputRow } from "./lib/modelOutputsRowMapper";
import { updateSelectedSimulationName } from "../../redux/actions/selectedSimulationActions";
import { getSelectedSimulationName } from "../../redux/reducers/selectedSimulationReducer";
import Alert, { AlertVariant } from "../../components/Alert";

export interface FilterVariant {
  text: string;
  value: string;
}

export interface FilterVariants {
  values: FilterVariant[];
}

const ModelOutputsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { simulationName } = useParams();

  const modelOutputData = useSelector(getStoredModelOutputs);
  const rowsServer = modelOutputData?.["model-outputs"] || [];
  const simulatedModels = useSelector(getSimulatedModels) || [];
  const modelOutputsAlertData = useSelector(getModelOutputsAlertData) || [];
  const simulations = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);
  const isLoading = useSelector(getIsSimulatedModelsLoading);
  const storedSimulationName = useSelector(getSelectedSimulationName);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 1,
    direction: "top",
  });

  const executionFrequencies = enumerators.find((enumerator) => enumerator["enum-type"] === "execution-frequencies");
  const [simulationNameFilters, simulationNameVariants, setSimulationNameFilters, setSimulationNameVariants] =
    useTableFilter({
      tableColIndex: 0,
    });

  const [sourceModelFilters, sourceModelVariants, setSourceModelFilters, setSourceModelVariants] = useTableFilter({
    tableColIndex: 1,
  });

  const [messageTypeFilters, messageTypeVariants, setMessageTypeFilters, setMessageTypeVariants] = useTableFilter({
    tableColIndex: 2,
  });

  const rowsPerPage = 10;

  const simulatedModelsNames = useMemo(() => getUniqSelectItems(simulations, "simulation-name"), [simulations]);
  const messageTypesEnum = useMemo(() => enumerators.find((el) => el["enum-type"] === "message-types"), [enumerators]);

  const sourceModels = useMemo(() => getUniqSelectItems(simulatedModels, "model-full-path"), [simulatedModels]);

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
      searchMatch(el.cells[0].text as string, searchValue) || searchMatch(el.cells[3].text as string, searchValue);

    if (searchValue && !isOneFieldMatch) return false;

    if (sourceModelFilters.filters.length) {
      let availableFilter;

      for (let filter of sourceModelFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[sourceModelFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (messageTypeFilters.filters.length) {
      let availableFilter;

      for (let filter of messageTypeFilters.filters) {
        filter = filter.toLowerCase();
        const isTextMatch = filter == (el.cells[messageTypeFilters.index].text as string).toLowerCase?.();

        if (isTextMatch) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const resetAlert = () =>
    dispatch(
      updateModelOutputAlertData({
        isVisible: false,
        text: "",
      }),
    );

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionModelOutputs = (action: (props: Required<ManageModelOutputServerProps>) => any) => () => {
    selectedTableElements.forEach((row) =>
      dispatch(action({ "model-output-id": +row.id, "simulation-name": simulationNameFilters.filters[0] })),
    );
  };

  const clearAllFilters = () => {
    setSourceModelFilters({ ...sourceModelFilters, filters: [] });
    setMessageTypeFilters({ ...messageTypeFilters, filters: [] });
  };

  useEffect(() => {
    dispatch(getEnumeratorsServer());
    dispatch(getSimulationsServer({}));

    return () => {
      resetAlert();
    };
  }, []);

  useEffect(() => {
    const rows = formatModelOutputRow(rowsServer, navigate, messageTypesEnum);

    setRows(rows);
  }, [rowsServer, messageTypesEnum]);

  useEffect(() => {
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

    setSourceModelVariants({
      values: sourceModels.map((el) => ({
        text: el,
        value: el,
      })),
    });

    if (messageTypesEnum)
      setMessageTypeVariants({
        values: messageTypesEnum?.["enum-values"].map((el) => ({
          text: el["enum-value-string"],
          value: el["enum-value-string"],
        })),
      });
  }, [sourceModels, simulatedModelsNames, messageTypesEnum]);

  useEffect(() => {
    if (!simulationNameFilters.filters.length) return;
    const simName = simulationNameFilters.filters[0];

    dispatch(
      fetchModelOutputsListServer({
        "simulation-name": simName,
      }),
    );

    dispatch(
      getSimulatedModelsServer({
        simulationName: simName,
      }),
    );

    navigate(pages.modelOutputsList(simName), { replace: true });
    dispatch(updateSelectedSimulationName(simName));
  }, [simulationNameFilters.filters]);

  const addModelOutputHref = `${pages.addModelOutput()}/${simulationNameFilters.filters[0]}`;

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search model output" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button color="blue" size="small" onClick={() => navigate(addModelOutputHref)}>
            Add new model output
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
                text="Source Model"
                filters={sourceModelFilters.filters}
                variants={sourceModelVariants}
                handleChangeFilter={resetAlert}
                setFilters={setSourceModelFilters}
              />
              <TableFilter
                text="Message type"
                filters={messageTypeFilters.filters}
                variants={messageTypeVariants}
                handleChangeFilter={resetAlert}
                setFilters={setMessageTypeFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(simulationNameFilters)}
              {getSelectedFilters(sourceModelFilters, setSourceModelFilters)}
              {getSelectedFilters(messageTypeFilters, setMessageTypeFilters)}
              {hasAnyLength(sourceModelFilters, messageTypeFilters) && (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              )}
            </ActiveFilters>

            {modelOutputsAlertData.isVisible && (
              <Alert variant={AlertVariant.success} title={modelOutputsAlertData.text} />
            )}

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
              <Button color="blue" onClick={handleActionModelOutputs(cloneModelOutputServer)}>
                Duplicate model output
              </Button>
              <Button color="red" onClick={handleActionModelOutputs(deleteModelOutputServer)}>
                Delete selected model outputs
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
    text: "Output Message Alias",
    align: "center",
    filterable: true,
    width: 25,
  },
  {
    text: "Source Model",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Message type",
    align: "center",
    filterable: true,
    width: 10,
  },
  {
    text: "Output structure name",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Generic output identifier",
    align: "center",
    filterable: true,
    width: 18,
  },
  {
    text: "# of models using",
    align: "center",
    filterable: true,
    width: 7,
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

export default withSimulation(ModelOutputsList);
