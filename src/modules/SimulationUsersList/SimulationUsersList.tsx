import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, styled, Typography } from "@mui/material";
import { useState, ChangeEvent, useEffect, ReactElement } from "react";

import Input from "../../components/Inputs/Input";
import Button from "../../components/Button/Button";
import withSimulation from "../../hocs/withSimulation";
import SearchIcon from "../../components/Icons/SearchIcon";
import PageLoader from "../../components/PageLoader/PageLoader";
import TableFilter from "../../components/TableFilter/TableFilter";
import CheckboxTable, { Filter, Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";
import { pages } from "../../lib/routeUtils";
import {
  GetSimulationUsersServerProps,
  deleteSimulationUserServer,
  getSimulationUsersServer,
} from "../../redux/actions/simulationUsersActions";
import { dateFormatWithTime } from "../../lib/dateFormat";
import { SimulationUser } from "../../types/simulationUser";
import { getIsHydrated } from "../../redux/reducers/appReducer";
import { getAreSimulationUsersLoading, getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { getEnumerators } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer } from "../../redux/actions/simulationsActions";

const headers: Header[] = [
  {
    text: "Full Name",
    align: "center",
    filterable: true,
    width: 14.2,
  },
  {
    text: "User Name",
    align: "center",
    filterable: true,
    width: 13.6,
  },
  {
    text: "User Role",
    align: "center",
    filterable: true,
    width: 15.6,
  },
  {
    text: "Status",
    align: "center",
    filterable: true,
    width: 10,
  },
  {
    text: "Last Login",
    align: "center",
    filterable: true,
    width: 13.6,
  },
  {
    text: "Max # of sessions",
    align: "center",
    filterable: false,
    width: 16.6,
  },
  {
    text: "Max # of processes",
    align: "center",
    filterable: false,
    width: 23.6,
  },
];

const SimulationUsersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rowsServer: SimulationUser[] = useSelector(getSimulationUsers);
  const isHydrated = useSelector(getIsHydrated);
  const isLoading = useSelector(getAreSimulationUsersLoading);
  const enumerators = useSelector(getEnumerators);

  const userRoleValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "user-role");
  const userRoleItems = userRoleValues ? userRoleValues["enum-values"].map((value) => value["enum-value-string"]) : [];
  const userStatusValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "user-statuses");
  const userStatues = userStatusValues
    ? userStatusValues["enum-values"].map((userRoleValue) => userRoleValue["enum-value-string"])
    : [];

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 1,
    direction: "top",
  });
  const rowsPerPage = 10;

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

  const filterRowsServer = (searchValue: string, simulationUser: SimulationUser) => {
    const searchLower = searchValue.toLowerCase();
    const searchableFields = ["first-name", "last-name", "user-name", "associated-projects"];

    for (const field of searchableFields) {
      const fieldValue = simulationUser[field as keyof SimulationUser];
      if (fieldValue !== undefined && fieldValue !== null) {
        const text = fieldValue.toString().toLowerCase();
        if (text.includes(searchLower)) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    dispatch(getEnumeratorsServer());
  }, []);

  useEffect(() => {
    if (isHydrated) {
      dispatch(getSimulationUsersServer({}));
    }
  }, []);

  useEffect(() => {
    if (!rowsServer) return;
    const rows: Row[] = rowsServer
      .filter((user) => filterRowsServer(searchValue, user))
      .map((row) => ({
        id: Number(row["user-id"]),
        checked: false,
        cells: [
          {
            align: "left",
            text: row["full-name"],
            decorator: (text: string | ReactElement) => <u style={{ cursor: "pointer" }}>{text}</u>,
            handler: () => navigate(`${pages.editSimulationUser()}/${row["user-id"]}`),
          },
          { align: "left", text: row["user-name"] },
          { align: "center", text: row["user-role"] },
          { align: "center", text: row["user-status"] },
          {
            align: "center",
            text: row["last-login-date"] ? dateFormatWithTime(new Date(row["last-login-date"])) : "-",
          },
          { align: "center", text: row["max-number-of-sessions"].toString() },
          { align: "center", text: row["max-number-of-processes"].toString() },
        ],
      }));
    setRows(rows);
  }, [rowsServer, searchValue]);

  const variants = {
    values: userStatues.map((item) => ({
      text: item,
      value: item,
    })),
  };

  const variants1 = {
    values: userRoleItems.map((item) => ({
      text: item,
      value: item,
    })),
  };

  const [statusFilters, setStatusFilters] = useState<Filter>({
    index: 3,
    filters: [],
  });

  const [roleFilters, setRoleFilters] = useState<Filter>({
    index: 2,
    filters: [],
  });

  const clearAllFilters = () => {
    setStatusFilters({ ...statusFilters, filters: [] });
    setRoleFilters({ ...roleFilters, filters: [] });
  };

  const filterRows = (el: Row) => {
    if (statusFilters.filters.length) {
      let availableFilter;

      for (let filter of statusFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[statusFilters.index].text as string).toLowerCase?.()) availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    if (roleFilters.filters.length) {
      let availableFilter;

      for (let filter of roleFilters.filters) {
        filter = filter.toLowerCase();
        if (filter == (el.cells[roleFilters.index].text as string).replace("-", " ").toLowerCase?.())
          availableFilter = true;
      }

      if (!availableFilter) return false;
    }

    return true;
  };

  const seletedLength = rows.filter(filterRows).filter((elem) => elem.checked);

  const handleActionSimulationUsers = (action: (props: Required<GetSimulationUsersServerProps>) => any) => () => {
    const checkedRows = rows.filter(filterRows).filter((row) => row.checked);
    checkedRows.forEach((row) => dispatch(action({ "user-id": row.id as number })));
  };

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search user name" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
        <AddSimulationWrapper>
          <Button color="blue" size="small" href={pages.createSimulationUser()}>
            Add New User
          </Button>
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
              <TableFilter text="Role" filters={roleFilters.filters} variants={variants1} setFilters={setRoleFilters} />
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
              {roleFilters.filters.map((filter) => (
                <ActiveFilter key={roleFilters.index + filter}>
                  {filter}
                  <CloseBtn
                    onClick={() =>
                      setRoleFilters({
                        ...roleFilters,
                        filters: [...roleFilters.filters].filter(
                          (sessionFilter) => sessionFilter !== filter,
                        ) as string[],
                      })
                    }
                  />
                </ActiveFilter>
              ))}
              {roleFilters.filters.length || statusFilters.filters.length ? (
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
              <Button color="red" onClick={handleActionSimulationUsers(deleteSimulationUserServer)}>
                Delete selected simulation users
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

export default withSimulation(SimulationUsersList);
