import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { Box, Typography, styled } from "@mui/material";

import withSimulation from "../../hocs/withSimulation";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";
import { getAllCustomViews } from "../../redux/reducers/customViewsReducer";
import { getAreSimulationsLoading, getSimulations } from "../../redux/reducers/simulationsReducer";
import { dateFormatWithTime } from "../../lib/dateFormat";
import { pages } from "../../lib/routeUtils";
import {
  DeleteCustomViewServerProps,
  cloneCustomViewServer,
  deleteCustomViewServer,
  getCustomViewsListServer,
} from "../../redux/actions/customViewsActions";
import Input from "../../components/Inputs/Input";
import SearchIcon from "../../components/Icons/SearchIcon";
import Button from "../../components/Button/Button";
import TableFilter from "../../components/TableFilter/TableFilter";
import PageLoader from "../../components/PageLoader/PageLoader";
import { getSimulationsServer } from "../../redux/actions/simulationsActions";
import { getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { SimulationUser } from "../../types/simulationUser";
import { getSimulationUsersServer } from "../../redux/actions/simulationUsersActions";
import { CustomViewType } from "../../types/customViews";

const headers: Header[] = [
  {
    text: "Custom view name",
    align: "center",
    filterable: true,
  },
  {
    text: "Simulation name",
    align: "center",
    filterable: true,
  },
  {
    text: "Simulation Owner",
    align: "center",
    filterable: true,
  },
  {
    text: "Creation date",
    align: "center",
    filterable: true,
  },
  {
    text: "Custom view grid template name",
    align: "center",
    filterable: true,
  },
  {
    text: "Display after view",
    align: "center",
    filterable: true,
  },
  {
    text: "Status",
    align: "center",
    filterable: true,
  },
];

const CustomViewsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customViews = useSelector(getAllCustomViews);
  const simulations = useSelector(getSimulations);
  const isLoading = useSelector(getAreSimulationsLoading);
  const simulationUsers: SimulationUser[] = useSelector(getSimulationUsers);

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 1,
    direction: "top",
  });
  const rowsPerPage = 10;

  const [simulationNameFilters, setSimulationNameFilters] = useState<Filter>({
    index: 1,
    filters: [],
  });

  const [simulationOwnerFilter, setSimulationOwnerFilter] = useState<Filter>({
    index: 2,
    filters: [],
  });

  const [statusFilters, setStatusFilters] = useState<Filter>({
    index: 7,
    filters: [],
  });

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  useEffect(() => {
    dispatch(getCustomViewsListServer());
    dispatch(getSimulationsServer({}));
    dispatch(getSimulationUsersServer({}));
  }, []);

  useEffect(() => {
    if (!customViews) return;

    const rows: any[] = customViews
      ?.filter((row) => filterRowsServer(searchValue, row))
      .map((row: any) => ({
        id: `${row["simulation-id"]}-${row["custom-view-id"]}`,
        checked: false,
        cells: [
          {
            align: "left",
            text: row["custom-view-caption"],
            decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
            handler: () => navigate(`${pages.editCustomView()}/${row["simulation-id"]}/${row["custom-view-id"]}`),
          },
          { align: "left", text: row["simulation-name"] },
          {
            align: "left",
            text: simulations?.find((el) => el["simulation-id"] === row["simulation-id"])?.["simulation-owner-name"],
          },

          {
            align: "left",
            text: dateFormatWithTime(new Date(row["creation-date"]), true),
          },
          { align: "left", text: row["custom-view-grid-template-name"] },
          {
            align: "center",
            text: customViews[row["custom-view-menu-index"] - 1]
              ? customViews[row["custom-view-menu-index"] - 1]["custom-view-caption"]
              : "Simulation data browser",
          },
          {
            align: "center",
            text: row["is-custom-view-active"] ? "Active" : "Inactive",
          },
        ],
      }));

    setRows(rows);
  }, [customViews, simulations, searchValue]);

  const variants = {
    values: [
      { text: "Active", value: "Active" },
      { text: "Inactive", value: "Inactive" },
      { text: "All", value: "All" },
    ],
  };

  const variants2 = {
    values: simulationUsers.map((user) => ({
      text: user["full-name"],
      value: user["full-name"],
    })),
  };

  const variants3 = {
    values: simulations.map((simulation) => ({
      text: `${simulation["simulation-name"]} [${simulation["simulation-owner-name"]}]`,
      value: `${simulation["simulation-name"]} [${simulation["simulation-owner-name"]}]`,
    })),
  };

  const clearAllFilters = () => {
    setStatusFilters({ ...statusFilters, filters: [] });
    setSimulationOwnerFilter({ ...simulationOwnerFilter, filters: [] });
    setSimulationNameFilters({ ...simulationNameFilters, filters: [] });
  };

  const filterRowsServer = (searchValue: string, customView: CustomViewType) => {
    const searchText = searchValue.toLowerCase();
    const searchFields = ["custom-view-caption"];

    for (const field of searchFields) {
      const fieldValue = customView[field as keyof CustomViewType];
      if (fieldValue !== undefined && fieldValue !== null) {
        const text = fieldValue.toString().toLowerCase();
        if (text.includes(searchText)) {
          return true;
        }
      }
    }

    return false;
  };

  const filterRows = (el: Row) => {
    if (statusFilters.filters.length) {
      let availableFilter;

      for (let filter of statusFilters.filters) {
        filter = filter.toLowerCase();

        if (filter == (el.cells[statusFilters.index].text as string).toLowerCase?.() || filter === "all")
          availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (simulationOwnerFilter.filters.length) {
      let availableFilter;

      for (let filter of simulationOwnerFilter.filters) {
        filter = filter.toLowerCase();
        const simulationOwner = simulationUsers.find((user) => user["full-name"].toLowerCase() === filter);

        if (
          simulationOwner &&
          simulationOwner["user-name"].toLowerCase() ===
            (el.cells[simulationOwnerFilter.index].text as string).toLowerCase?.()
        ) {
          availableFilter = true;
        }
      }

      if (!availableFilter) return false;
    }

    if (simulationNameFilters.filters.length) {
      let availableFilter;

      for (let filter of simulationNameFilters.filters) {
        filter = filter.toLowerCase();
        const simulation = simulations.find((simulation) => {
          const a = (simulation["simulation-name"] + " [" + simulation["simulation-owner-name"] + "]").toLowerCase();
          const b = filter;
          return a === b;
        });

        if (
          simulation &&
          simulation["simulation-name"].toLowerCase() ===
            (el.cells[simulationNameFilters.index].text as string).toLowerCase?.() &&
          simulation["simulation-owner-name"].toLowerCase() ===
            (el.cells[simulationOwnerFilter.index].text as string).toLowerCase?.()
        ) {
          const isSimulationIdEqual = customViews?.find((row) => {
            const a = Number(row["simulation-id"]);
            const b = simulation["simulation-id"];
            return Number(row["simulation-id"]) === simulation["simulation-id"];
          });
          if (isSimulationIdEqual) {
            availableFilter = true;
          }
        }
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const seletedLength = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionCustomViews = (action: (props: DeleteCustomViewServerProps) => any) => () => {
    if (!rows) return;

    const checkedRows = rows.filter(filterRows).filter((row) => row.checked);

    // row["simulation-id"]}-${row["custom-view-id"]

    checkedRows.forEach((row) =>
      dispatch(
        action({
          "simulation-id": Number(row.id.toString().split("-")[0]),
          "custom-view-id": Number(row.id.toString().split("-")[1]),
        }),
      ),
    );
  };

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search Id & models" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddSimulationWrapper>
          <NavLink to={`${pages.createCustomView()}`}>
            <Button color="blue" size="small">
              Add new custom view
            </Button>
          </NavLink>
        </AddSimulationWrapper>
      </TableHeader>
      <TableBody>
        {!isLoading ? (
          <>
            <Filters>
              <TableFilter
                text="Status"
                filters={statusFilters.filters}
                variants={variants}
                setFilters={setStatusFilters}
              />
              <TableFilter
                text="Simulation Owner"
                filters={simulationOwnerFilter.filters}
                variants={variants2}
                setFilters={setSimulationOwnerFilter}
              />
              <TableFilter
                text="Simulation"
                filters={simulationNameFilters.filters}
                variants={variants3}
                setFilters={setSimulationNameFilters}
              />
            </Filters>
            <ActiveFilters>
              {statusFilters.filters.map((filter) => (
                <ActiveFilter key={statusFilters.index + filter}>
                  {filter}
                  <CloseBtn
                    onClick={() =>
                      setStatusFilters({
                        ...statusFilters,
                        filters: [...statusFilters.filters].filter(
                          (statusFilter) => statusFilter !== filter,
                        ) as string[],
                      })
                    }
                  />
                </ActiveFilter>
              ))}

              {[statusFilters].map((elem) => elem.filters).flat().length ? (
                <ActiveFilter>
                  Clear all filters <CloseBtn onClick={clearAllFilters} />
                </ActiveFilter>
              ) : null}
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
        ) : (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        )}
        {!!seletedLength.length && (
          <FooterActions>
            <SelectedCount>{seletedLength.length} Item Selected</SelectedCount>
            <Buttons>
              <Button color="blue" onClick={handleActionCustomViews(cloneCustomViewServer)}>
                Duplicate selected custom views
              </Button>
              <Button color="red" onClick={handleActionCustomViews(deleteCustomViewServer)}>
                Delete selected custom views
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

const AddSimulationWrapper = styled("div")(({ theme }) => ({
  ".MuiButtonBase-root": {
    padding: "16px",
    fontSize: theme.typography.subtitle1.fontSize,

    ".MuiTypography-root": {
      color: theme.palette.additional[200],
    },
  },
}));

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

export default withSimulation(CustomViewsList);
