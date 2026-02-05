import { ChangeEvent, useEffect, useState, useRef } from "react";
import { Box, styled } from "@mui/material";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import withSimulation from "../../hocs/withSimulation";

import Input from "../../components/Inputs/Input";
import SearchIcon from "../../components/Icons/SearchIcon";
import CheckboxTable, { Header, Row, Sort } from "../../components/Tables/CheckboxTable/CheckboxTable";
import { searchMatch } from "../../lib/searchMatch";
import PageLoader from "../../components/PageLoader/PageLoader";
import { getAreSimulationsLoading, getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import {
  getEnumeratorsServer,
  getSimulationsExtendedInfoServer,
  manageSimulationsServer,
} from "../../redux/actions/simulationsActions";
import { getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { SimulationUser } from "../../types/simulationUser";
import { getSimulationUsersServer } from "../../redux/actions/simulationUsersActions";
import { getIsHydrated } from "../../redux/reducers/appReducer";
import { getUserData } from "../../redux/reducers/authReducer";
import { formatSimulationRow } from "./lib/generateCodeRowMap";
import { ManageSimulationAction } from "../../types/simulations";

const ROWS_PER_PAGE = 10 as const;
const POLLING_INTERVAL = 5000 as const; // 5 seconds

const headers: Header[] = [
  {
    text: "Simulation name",
    align: "center",
    filterable: true,
    width: 17,
  },
  {
    text: "Develop Simulation output path",
    align: "center",
    filterable: false,
    width: 26,
  },
  {
    text: "Simulation status",
    align: "center",
    filterable: false,
    width: 15,
  },
  {
    text: "Generate code",
    align: "center",
    filterable: false,
    width: 14,
  },
  {
    text: "Build executable",
    align: "center",
    filterable: false,
    width: 14,
  },
  {
    text: "Executable exists",
    align: "center",
    filterable: false,
    width: 14,
  },
];

const GenerateSimulationCode = () => {
  const dispatch = useDispatch();

  const rowsServer = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);
  const isLoading = useSelector(getAreSimulationsLoading);
  const simulationUsers: SimulationUser[] = useSelector(getSimulationUsers);
  const isHydrated = useSelector(getIsHydrated);
  const authData = useSelector(getUserData);

  const navigate = useNavigate();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const buildingSimulationsRef = useRef<Set<number>>(new Set());

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [hasExecutableBuilding, setHasExecutableBuilding] = useState<boolean>(false);
  const [sortColIndex, setSortColIndex] = useState<Sort>({
    colIndex: 0,
    direction: "top",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  const refreshSimulations = () => {
    dispatch(getSimulationsExtendedInfoServer({}));
  };

  // Direct API call for polling that bypasses Redux
  const pollSimulationsData = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_LINK || "";
      const accessToken = authData["access-token"];

      const response = await fetch(`${baseURL}/list-simulations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "access-token": accessToken,
        },
      });

      if (response.ok) {
        const simulationsData = await response.json();

        // Check for completed builds and show toast
        simulationsData.forEach((sim: any) => {
          const id = sim["simulation-id"];
          const status = sim["simulation-status"] as string;
          const executableExists = sim["simulation-executable-exists"] as boolean;

          if (buildingSimulationsRef.current.has(id) && status !== "Executable building") {
            if (executableExists) {
              toast.success(`Simulation ${sim["simulation-name"]} executable has been built!`);
            } else {
              toast.error(
                `Error ocurred during build of simulation ${sim["simulation-name"]} executable, see build logs in simulation Logs folder`,
              );
            }
          }
        });

        // Update building simulations ref and check if we still need to poll
        const currentBuildingIds = new Set<number>();
        const hasBuilding = simulationsData.some((simulation: any) => {
          const status = simulation["simulation-status"] as string;
          if (status === "Executable building") {
            currentBuildingIds.add(simulation["simulation-id"]);
            return true;
          }
          return false;
        });
        buildingSimulationsRef.current = currentBuildingIds;
        setHasExecutableBuilding(hasBuilding);

        // Create new rows with updated data - much simpler than cell-by-cell updates
        const newRows: Row[] = formatSimulationRow({
          rows: simulationsData,
          navigate,
          handleCodeGeneration: generateSimulationCode,
          handleBuildExecutable: buildExecutable,
          enumerators,
        });
        setRows(newRows);
      } else {
        console.error("Polling response not OK:", response.status, response.statusText);
        // Fallback to Redux dispatch on non-200 response
        dispatch(getSimulationsExtendedInfoServer({}));
      }
    } catch (error) {
      console.error("Polling error:", error);
      // Fallback to Redux dispatch on error
      dispatch(getSimulationsExtendedInfoServer({}));
    }
  };

  const filterRows = (el: Row) => {
    if (searchValue && !searchMatch(el.cells[0].text as string, searchValue)) return false;

    return true;
  };

  const generateSimulationCode = (id: number) => {
    dispatch(manageSimulationsServer({ "simulation-id": id, "action-type": ManageSimulationAction.generateCode }));
    // Refresh simulations after dispatching the action
    setTimeout(() => {
      refreshSimulations();
    }, 500); // Small delay to allow server processing
  };

  const buildExecutable = (id: number) => {
    dispatch(manageSimulationsServer({ "simulation-id": id, "action-type": ManageSimulationAction.buildExecutable }));
    // Refresh simulations after dispatching the action
    setTimeout(() => {
      refreshSimulations();
    }, 500); // Small delay to allow server processing
  };

  useEffect(() => {
    if (isHydrated) {
      dispatch(getSimulationUsersServer({}));
      // Always refresh simulations and enumerators data when entering this screen
      // This ensures we get the latest state including executable existence
      refreshSimulations();
      dispatch(getEnumeratorsServer());
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!rowsServer) return;

    // Check if any simulation has "Executable building" status
    const buildingSims = rowsServer.filter((simulation) => {
      const status = simulation["simulation-status"] as string;
      return status === "Executable building";
    });
    // Update ref
    buildingSimulationsRef.current = new Set(buildingSims.map((s) => s["simulation-id"]));

    const hasBuilding = buildingSims.length > 0;
    setHasExecutableBuilding(hasBuilding);

    // Simple: always create new rows from Redux data
    const newRows: Row[] = formatSimulationRow({
      rows: rowsServer,
      navigate,
      handleCodeGeneration: generateSimulationCode,
      handleBuildExecutable: buildExecutable,
      enumerators,
    });
    setRows(newRows);
  }, [rowsServer, enumerators]);

  // Polling effect for simulations in "Executable building" status
  useEffect(() => {
    if (hasExecutableBuilding) {
      // Start polling every 5 seconds using direct API calls
      pollingIntervalRef.current = setInterval(() => {
        pollSimulationsData();
      }, POLLING_INTERVAL);
    } else {
      // Stop polling if no simulations are building
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup interval on unmount or when polling stops
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [hasExecutableBuilding]);

  return (
    <Wrapper>
      <TableHeader>
        <SearchWrapper>
          <Input placeholder="Search configuration" value={searchValue} handleChange={handleChange} fullWidth />
          <SearchIcon />
        </SearchWrapper>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        ) : (
          <>
            <CheckboxTable
              rows={rows.filter(filterRows)}
              headers={headers}
              page={page}
              setPage={setPage}
              rowsPerPage={ROWS_PER_PAGE}
              sortColIndex={sortColIndex.colIndex}
              setSortColIndex={setSortColIndex}
              sortDirection={sortColIndex.direction}
            />
          </>
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

const TableBody = styled("div")({
  padding: "0 24px 20px",
});

export default withSimulation(GenerateSimulationCode);
