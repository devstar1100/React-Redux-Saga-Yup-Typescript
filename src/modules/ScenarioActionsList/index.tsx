import { ChangeEvent, useEffect, useState } from "react";
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

import { formatScenarioActionsRow } from "./lib/scenarioRowMapper";
import { ManageScenarioActionTypes } from "../../redux/actions/scenarioFilesActions";
import { getCurrentScenarioFiles, getIsScenarioFilesLoading } from "../../redux/reducers/scenarioFilesReducer";
import { getCurrentScenarioListActions } from "../../redux/reducers/scenarioActionsReducer";
import { getEnumeratorsServer } from "../../redux/actions/simulationsActions";
import {
  getScenarioListActionsServer,
  manageScenarioListActionsServer,
  updateScenarioListActionsData,
} from "../../redux/actions/scenarioListActions";
import { ScenarioAction } from "../../types/scenarioAction";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { getEnumerators } from "../../redux/reducers/simulationsReducer";
import ArrowDownIcon from "../../components/Icons/ArrowDownIcon";
import { getSimDependantPageFullLink } from "../../lib/simulationConfigurationUtils";

export interface FilterVariant {
  text: string;
  value: string;
}

export interface FilterVariants {
  values: FilterVariant[];
}

const ScenarioActionsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { simulationId: simIdStr, sessionId: sessionIdStr, listId } = useParams();

  const simulationId = Number(simIdStr);
  const sessionId = Number(sessionIdStr);

  const scenarioActions = useSelector(getCurrentScenarioListActions);
  const scenarioFiles = useSelector(getCurrentScenarioFiles);
  const enumerators = useSelector(getEnumerators);

  const isLoading = useSelector(getIsScenarioFilesLoading);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 1,
    direction: "top",
  });

  const actionKeys = getUniqSelectItems(scenarioActions, "action-type");

  const [actionKeysFilters, actionKeysVariants, setActionKeysFilters, setActionKeysVariants] = useTableFilter({
    tableColIndex: 1,
  });

  const currentFileTimeRepresentation =
    scenarioFiles.find((file) => String(file["scenario-file-id"]) === listId)?.["time-representation"] || "Ticks";

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

    if (actionKeysFilters.filters.length) {
      let availableFilter;

      for (let filter of actionKeysFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[actionKeysFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const selectedTableElements = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionScenarioFiles = (actionType: ManageScenarioActionTypes) => () => {
    selectedTableElements.forEach((row) => {
      const currentRow = scenarioActions.find((rowServer) => rowServer["action-key"] === row.id) as ScenarioAction;

      dispatch(
        manageScenarioListActionsServer({
          actionType,
          scenarioFileId: listId ? parseInt(listId) : 0,
          actionKey: currentRow["action-key"],
        }),
      );
    });
  };

  const clearAllFilters = () => {
    setActionKeysFilters({ ...actionKeysFilters, filters: [] });
  };

  useEffect(() => {
    if (listId) dispatch(getScenarioListActionsServer(parseInt(listId)));
    dispatch(getEnumeratorsServer());

    return () => {
      dispatch(updateScenarioListActionsData([]));
    };
  }, [listId]);

  useEffect(() => {
    if (!scenarioActions || !listId) return;
    // const scenarioTimeRepresentation = enumerators.find(
    //   (enumerator) => enumerator["enum-type"] === "scenario-time-representation",
    // );

    const rows = formatScenarioActionsRow({
      rows: scenarioActions,
      listId: parseInt(listId),
      navigate,
      simulationId,
      sessionId,
    });

    setActionKeysVariants({
      values: actionKeys.map((el) => ({
        text: el,
        value: el,
      })),
    });

    setRows(rows);
  }, [scenarioActions, listId, enumerators]);

  return (
    <Wrapper>
      <TableHeader>
        <HeaderLeftGroup>
          <Back
            onClick={() =>
              navigate(getSimDependantPageFullLink({ baseRoute: pages.scenarioFiles(), simulationId, sessionId }))
            }
          >
            <ArrowDownIcon />
            <Typography variant="body2" color="grey.50">
              Back
            </Typography>
          </Back>
          <SearchWrapper>
            <Input placeholder="Search scenario action" value={searchValue} handleChange={handleChange} fullWidth />
            <SearchIcon />
          </SearchWrapper>
        </HeaderLeftGroup>
        <AddConfigurationWrapper>
          <Button
            color="blue"
            size="small"
            href={`${getSimDependantPageFullLink({
              baseRoute: pages.createScenarioAction(),
              simulationId,
              sessionId,
            })}/${listId}`}
          >
            Add new scenario action
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
                text="Action type"
                filters={actionKeysFilters.filters}
                variants={actionKeysVariants}
                setFilters={setActionKeysFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(actionKeysFilters, setActionKeysFilters)}
              {hasAnyLength(actionKeysFilters) && (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              )}
            </ActiveFilters>

            <CheckboxTable
              rows={rows.filter(filterRows)}
              headers={getHeaders(currentFileTimeRepresentation)}
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
                Duplicate selected scenario actions
              </Button>
              <Button color="red" onClick={handleActionScenarioFiles("delete")}>
                Delete selected scenario actions
              </Button>
            </Buttons>
          </FooterActions>
        )}
      </TableBody>
    </Wrapper>
  );
};

const getHeaders = (timeRepresentation: string): Header[] => [
  {
    text: "Action key",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: "Action type",
    align: "center",
    filterable: true,
    width: 20,
  },
  {
    text: timeRepresentation === "Ticks" ? "Tick number" : "Elapsed seconds",
    align: "center",
    filterable: true,
    width: 15,
  },
  {
    text: "Console message",
    align: "center",
    filterable: false,
    width: 20,
  },
  {
    text: "Number of parameters",
    align: "center",
    filterable: false,
    width: 20,
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

const HeaderLeftGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  columnGap: "20px",
  alignItems: "center",

  "& svg path": {
    stroke: theme.palette.grey[50],
  },
}));

const Back = styled(Box)({
  display: "flex",
  columnGap: "8px",
  alignItems: "center",
  cursor: "pointer",

  "& svg": {
    transform: "rotate(90deg)",
  },
});

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

export default withSimulation(ScenarioActionsList);
