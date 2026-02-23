import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router";

import withSimulation from "../../hocs/withSimulation";

import Input from "../../components/Inputs";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button";
import TableFilter from "../../components/TableFilter";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable";
import { useDispatch, useSelector } from "react-redux";
import { searchMatch } from "../../lib/searchMatch";
import PageLoader from "../../components/PageLoader";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import { getAreSimulationsLoading, getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { Simulation } from "../../types/simulations";
import { pages } from "../../lib/routeUtils";
import { formatModelInputRow } from "./lib/modelInputRowMap";
import { getModelInputsAlertData, getModels, getStoredModelInputs } from "../../redux/reducers/modelInputsReducer";
import {
  cloneModelInputsServer,
  deleteModelInputsServer,
  fetchListModelsServer,
  fetchModelInputsServer,
  IManageModelInputsActionIntersection,
  updateModelInputAlertData,
} from "../../redux/actions/modelInputsActions";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { getSelectedSimulationName } from "../../redux/reducers/selectedSimulationReducer";
import { updateSelectedSimulationName } from "../../redux/actions/selectedSimulationActions";
import Alert, { AlertVariant } from "../../components/Alert";
import { getModelOutputsAlertData } from "../../redux/reducers/modelOutputsReducer";

const headers: Header[] = [
  {
    text: "Input Message Alias",
    align: "center",
    filterable: true,
    width: 30,
  },
  {
    text: "Source Model",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Target Model",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Message type",
    align: "center",
    filterable: false,
    width: 10,
  },
  {
    text: "Generic output identifier",
    align: "center",
    filterable: false,
    width: 20,
  },
];

interface FilterVariantValue {
  text: string;
  value: string | number;
}

interface FilterVariant {
  values: FilterVariantValue[];
}

interface ModelInputsVariants {
  messageType: FilterVariant;
  simulationNameFilters: FilterVariant;
  sourceModelFilters: FilterVariant;
  targetModelFilters: FilterVariant;
}

const ROWS_PER_PAGE = 10 as const;

const ModelInputsList = () => {
  const dispatch = useDispatch();
  const simulations: Simulation[] = useSelector(getSimulations);
  const rowsServer = useSelector(getStoredModelInputs);
  const enumerators = useSelector(getEnumerators);
  const isLoading = useSelector(getAreSimulationsLoading);
  const listModels = useSelector(getModels);
  const storedSimulationName = useSelector(getSelectedSimulationName);
  const modelInputsAlertData = useSelector(getModelInputsAlertData);

  const navigate = useNavigate();
  const { simulationName } = useParams();

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 2,
    direction: "top",
  });

  const [messageFilters, setMessageFilters] = useState<Filter>({
    index: 3,
    filters: [],
  });

  const [simulationNameFilters, setSimulationNameFilters] = useState<Filter>({
    index: 4,
    filters: [],
  });

  const [sourceModelFilters, setSourceModelFilters] = useState<Filter>({
    index: 1,
    filters: [],
  });

  const [targetModelFilters, setTargetModelFilters] = useState<Filter>({
    index: 2,
    filters: [],
  });

  const [filterVariants, setFilterVariants] = useState<ModelInputsVariants>({
    messageType: {
      values: [],
    },
    simulationNameFilters: {
      values: [],
    },
    sourceModelFilters: {
      values: [],
    },
    targetModelFilters: {
      values: [],
    },
  });

  const simulatedModelsNames = useMemo(() => getUniqSelectItems(simulations, "simulation-name"), [simulations]);

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
    const inputStructureName = rowsServer.find((row) => row["model-input-id"] === el.id)?.["input-structure-name"];

    const textToSearch = inputStructureName ?? "";
    const cellText = el.cells[0].text as string;

    if (searchValue && !searchMatch(textToSearch, searchValue) && !searchMatch(cellText, searchValue)) return false;

    if (messageFilters.filters.length) {
      let availableFilter;

      for (let filter of messageFilters.filters) {
        filter = filter.toLowerCase();

        if (filter == (el.cells[messageFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (sourceModelFilters.filters.length) {
      let availableFilter;

      for (let filter of sourceModelFilters.filters) {
        filter = filter.toLowerCase();

        if (filter == (el.cells[sourceModelFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (targetModelFilters.filters.length) {
      let availableFilter;

      for (let filter of targetModelFilters.filters) {
        filter = filter.toLowerCase();

        if (filter == (el.cells[targetModelFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (sourceModelFilters.filters.length) {
      let availableFilter;

      for (let filter of sourceModelFilters.filters) {
        filter = filter.toLowerCase();

        if (filter == (el.cells[sourceModelFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const resetAlert = () =>
    dispatch(
      updateModelInputAlertData({
        isVisible: false,
        text: "",
      }),
    );

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionCustomViews = (action: (props: IManageModelInputsActionIntersection) => any) => () => {
    selectedTableElements.forEach((row) => {
      dispatch(
        action({
          "model-input-id": +row.id,
          "simulation-name": simulationNameFilters.filters[0],
        }),
      );
    });
  };

  const clearAllFilters = () => {
    setMessageFilters({ ...messageFilters, filters: [] });
    setSourceModelFilters({ ...sourceModelFilters, filters: [] });
    setTargetModelFilters({ ...targetModelFilters, filters: [] });
  };

  const getEnumeratorValues = (key: string) => {
    const values = enumerators
      .find((el) => el["enum-type"] === key)
      ?.["enum-values"].map((value) => ({
        text: value["enum-value-string"],
        value: value["enum-value-id"],
      })) as FilterVariantValue[];

    return values || [];
  };

  const getMessageType = (key: number): string =>
    getEnumeratorValues("message-types").find((el) => el.value === key)?.text || "";

  useEffect(() => {
    dispatch(getEnumeratorsServer());
    dispatch(getSimulationsServer({}));

    return () => {
      resetAlert();
    };
  }, []);

  useEffect(() => {
    if (!simulationNameFilters.filters.length) return;
    const simName = simulationNameFilters.filters[0];

    dispatch(
      fetchListModelsServer({
        "simulation-name": simName,
      }),
    );

    dispatch(fetchModelInputsServer({ "simulation-name": simName }));
    navigate(pages.modelInputs(simName), { replace: true });
    dispatch(updateSelectedSimulationName(simName));
  }, [simulationNameFilters.filters]);

  useEffect(() => {
    if (!rowsServer) return;

    const rows: Row[] = formatModelInputRow({ rows: rowsServer, navigate, getMessageType });

    setRows(rows);
  }, [rowsServer, enumerators]);

  useEffect(() => {
    if (!enumerators) return;

    const messageVariants = getEnumeratorValues("message-types");
    const simulationNameVariants = simulatedModelsNames.map((el) => ({
      text: el,
      value: el,
    }));

    if (simulatedModelsNames.length) {
      const defaultSimName =
        simulatedModelsNames.find((sim) => sim === simulationName || sim === storedSimulationName) ||
        simulatedModelsNames[0];

      setSimulationNameFilters((prev) => ({
        ...prev,
        filters: prev.filters.length ? prev.filters : [defaultSimName],
      }));
    }

    const sourceModelVariants = listModels
      .map((model) => {
        const obj: { text?: string; value?: string } = {};

        if (model["model-full-path"]) {
          obj.text = model["model-full-path"];
          obj.value = model["model-full-path"];
        }

        return obj as FilterVariantValue;
      })
      .filter((obj) => Object.keys(obj).length > 0);

    const targetModelVariants = listModels
      .map((model) => {
        const obj: { text?: string; value?: string } = {};

        if (model["model-full-path"]) {
          obj.text = model["model-full-path"];
          obj.value = model["model-full-path"];
        }

        return obj as FilterVariantValue;
      })
      .filter((obj) => Object.keys(obj).length > 0);

    setFilterVariants({
      messageType: {
        values: messageVariants,
      },
      simulationNameFilters: {
        values: [...simulationNameVariants],
      },
      sourceModelFilters: {
        values: [...sourceModelVariants],
      },
      targetModelFilters: {
        values: [...targetModelVariants],
      },
    });
  }, [enumerators, simulatedModelsNames, listModels]);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search model input" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button
            color="blue"
            size="small"
            href={`${pages.addModelInputs()}/${simulationName || storedSimulationName}`}
          >
            Add new model input
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
                variants={filterVariants.simulationNameFilters}
                handleChangeFilter={resetAlert}
                setFilters={setSimulationNameFilters}
                multiple={false}
              />
              <TableFilter
                text="Source Model"
                filters={sourceModelFilters.filters}
                variants={filterVariants.sourceModelFilters}
                handleChangeFilter={resetAlert}
                setFilters={setSourceModelFilters}
              />
              <TableFilter
                text="Target Model"
                filters={targetModelFilters.filters}
                variants={filterVariants.targetModelFilters}
                handleChangeFilter={resetAlert}
                setFilters={setTargetModelFilters}
              />
              <TableFilter
                text="Message type"
                filters={messageFilters.filters}
                variants={filterVariants.messageType}
                handleChangeFilter={resetAlert}
                setFilters={setMessageFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(simulationNameFilters)}
              {getSelectedFilters(sourceModelFilters, setSourceModelFilters)}
              {getSelectedFilters(targetModelFilters, setTargetModelFilters)}
              {getSelectedFilters(messageFilters, setMessageFilters)}
              {hasAnyLength(sourceModelFilters, messageFilters, targetModelFilters) && (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              )}
            </ActiveFilters>

            {modelInputsAlertData.isVisible && (
              <Alert variant={AlertVariant.success} title={modelInputsAlertData.text} />
            )}

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
          </>
        )}
        {!!selectedTableElements.length && (
          <FooterActions>
            <SelectedCount>{selectedTableElements.length} Item Selected</SelectedCount>
            <Buttons>
              <Button color="blue" onClick={handleActionCustomViews(cloneModelInputsServer)}>
                Duplicate model input
              </Button>
              <Button color="red" onClick={handleActionCustomViews(deleteModelInputsServer)}>
                Delete selected model inputs
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

export default withSimulation(ModelInputsList);
