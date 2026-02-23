import { ChangeEvent, useEffect, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { searchMatch } from "../../lib/searchMatch";
import { getSelectedFilters, hasAnyLength } from "../../lib/tableFilterHelpers";
import { ActiveFilter, CloseBtn } from "../../components/Tables/CheckboxTable/components/ActiveFilter";
import { getMonteCarloRecordsServer, manageMonteCarloRecordServer } from "../../redux/actions/monteCarloRecordsActions";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable";
import { MonteCarloRecord } from "../../types/monteCarloRecords";
import { formatMonteCarloRecordsRow } from "./lib/rowMapper";
import { pages } from "../../lib/routeUtils";
import {
  getCurrentMonteCarloRecords,
  getIsMonteCarloRecordsLoading,
} from "../../redux/reducers/monteCarloRecordsReducer";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs";
import Button from "../../components/Button";
import TableFilter from "../../components/TableFilter";
import SearchIcon from "../../components/Icons/SearchIcon";
import PageLoader from "../../components/PageLoader";
import ArrowDownIcon from "../../components/Icons/ArrowDownIcon";

interface FilterVariantValue {
  text: string;
  value: string;
}

interface FilterVariant {
  values: FilterVariantValue[];
}

interface MonteCarloRecordsVariants {
  recordTypeVariants: FilterVariant;
}

const MonteCarloRecordsList = () => {
  const dispatch = useDispatch();
  const { simulationId, filename } = useParams();

  const monteCarloRecordsServerLoading = useSelector(getIsMonteCarloRecordsLoading);
  const monteCarloRecordsServer: MonteCarloRecord[] = useSelector(getCurrentMonteCarloRecords);

  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });

  const [recordTypeFilters, setRecordTypeFilters] = useState<Filter>({
    index: 0,
    filters: [],
  });

  const [filterVariants, setFilterVariants] = useState<MonteCarloRecordsVariants>({
    recordTypeVariants: {
      values: [],
    },
  });

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
      !searchMatch(item.cells[1].text as string, searchValue) &&
      !searchMatch(item.cells[2].text as string, searchValue)
    )
      return false;

    if (recordTypeFilters.filters.length) {
      let availableFilter;

      for (let filter of recordTypeFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (item.cells[recordTypeFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }
      if (!availableFilter) return false;
    }
    return true;
  };

  const selectedTableElements = rows.filter(filterRows).filter((item) => item.checked);

  const handleActionMonteCarloRecords = (ActionType: "clone" | "delete") => {
    selectedTableElements.forEach((row) =>
      dispatch(
        manageMonteCarloRecordServer({
          "action-type": ActionType,
          "simulation-id": Number(simulationId),
          filename: filename as string,
          description: row.cells[1].text as string,
        }),
      ),
    );
  };

  const clearAllFilters = () => {
    setRecordTypeFilters({ ...recordTypeFilters, filters: [] });
  };

  useEffect(() => {
    dispatch(
      getMonteCarloRecordsServer({
        simulationId: Number(simulationId),
        filename: filename as string,
      }),
    );
  }, [simulationId, filename]);

  useEffect(() => {
    if (simulationId && filename) {
      const rows: Row[] = formatMonteCarloRecordsRow(monteCarloRecordsServer, navigate, simulationId, filename);
      setRows(rows);
      const recordTypes = monteCarloRecordsServer.map((item) => item["record-type"]);
      const simulationNameVariants = recordTypes.filter((value, index, self) => self.indexOf(value) === index);
      const newValues = simulationNameVariants.map((item) => ({
        text: item,
        value: item,
      }));
      setFilterVariants({
        recordTypeVariants: {
          values: newValues,
        },
      });
    }
  }, [monteCarloRecordsServer]);

  return (
    <Wrapper>
      <TableHeader>
        <Back onClick={() => navigate(pages.monteCarloFiles())}>
          <ArrowDownIcon />
          <Typography variant="body2" color="grey.50">
            Back
          </Typography>
        </Back>
        <SearchWrapper>
          <Input
            placeholder="Search Key and Parameter Path"
            value={searchValue}
            handleChange={handleChange}
            fullWidth
          />
          <SearchIcon />
        </SearchWrapper>
        <AddConfigurationWrapper>
          <Button
            color="blue"
            size="small"
            onClick={() => navigate(`${pages.addMonteCarloRecord()}/${simulationId}/${filename}`)}
          >
            Add New Record
          </Button>
        </AddConfigurationWrapper>
      </TableHeader>
      <TableBody>
        {monteCarloRecordsServerLoading ? (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        ) : (
          <>
            <Filters>
              <TableFilter
                text="simulation Name"
                filters={recordTypeFilters.filters}
                variants={filterVariants.recordTypeVariants}
                setFilters={setRecordTypeFilters}
              />
            </Filters>

            <ActiveFilters>
              {getSelectedFilters(recordTypeFilters, setRecordTypeFilters)}
              {hasAnyLength(recordTypeFilters) && (
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
              <Button color="blue" onClick={() => handleActionMonteCarloRecords("clone")}>
                Clone selected batches
              </Button>
              <Button color="red" onClick={() => handleActionMonteCarloRecords("delete")}>
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
    text: "Record Type",
    align: "center",
    filterable: false,
    width: 14,
  },
  {
    text: "Key",
    align: "center",
    filterable: true,
    width: 40,
  },
  {
    text: "Parameter path",
    align: "center",
    filterable: true,
    width: 14,
  },
  {
    text: "Parameter value",
    align: "center",
    filterable: false,
    width: 14,
  },
  {
    text: "Parameter standard deviation",
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

const Back = styled(Box)({
  display: "flex",
  columnGap: "8px",
  alignItems: "center",
  cursor: "pointer",

  "& svg": {
    transform: "rotate(90deg)",
  },
});

export default withSimulation(MonteCarloRecordsList);
