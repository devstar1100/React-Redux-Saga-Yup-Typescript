import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash.debounce";
import { Box, Typography, styled } from "@mui/material";

import DataTreeView from "./components/DataTreeView";
import { getSimulationDataBrowserFilters, getSimulationHyrarchy } from "../../redux/reducers/simulationReducer";
import {
  fetchSimulationHyrarchyServer,
  refreshSimulationDataServer,
  updateSimulationDataBrowserFilters,
} from "../../redux/actions/simulationActions";
import ComputerIcon from "../../components/Icons/ComputerIcon";
import { formatDate, timePattern } from "../../lib/dateUtils";
import NetworkIcon from "../../components/Icons/NetworkIcon";
import ChipIcon from "../../components/Icons/ChipIcon";
import ServersIcon from "../../components/Icons/ServersIcon";
import Seo from "../../components/Seo";
import withSimulation from "../../hocs/withSimulation";
import { Model, ModelDataItem } from "../../types/simulations";
import { getTheme } from "../../lib/theme/theme";
import Input from "../../components/Inputs";
import SearchIcon from "../../components/Icons/SearchIcon";
import Select from "../../components/Select";
import { DataBrowserFilterKey, FilterOption } from "../../hocs/withAddWidget";
import MultiSelect from "../../components/MultiSelect";
import { DataBrowserFilters } from "../../types/dataBrowserFilters";
import { getMapSystemModelsList } from "../../lib/getMapSystemModelsList";

interface Props {
  simulationId: number;
  sessionId: number;
  disableOverlay?: boolean;
  hideHeaderActionElements?: boolean;
  handleNodeSelect?: (event: any, nodeId: string) => void;
  externalFilters?: DataBrowserFilters;
  paramEditOnDlClick?: boolean;
}

interface FetchHyrarchyDataProps {
  maxNum?: number;
  startIdx?: number;
  expand?: boolean;
  searchQuery?: string;
  systemIds?: number[];
  modelIds?: number[];
  substitudeData?: boolean;
  instanceNumber?: string;
}

const IGNORE_WHILE_SEARCHING = ["simulation_data-remote_servers", "simulation_data-session_data"];

export const SimulationDataBrowser = ({
  sessionId,
  disableOverlay = false,
  hideHeaderActionElements = false,
  handleNodeSelect,
  externalFilters,
  paramEditOnDlClick = false,
}: Props) => {
  const dispatch = useDispatch();
  const simulationHierarchy = useSelector(getSimulationHyrarchy);
  // const { isSimulationDataLoading, isSimulationHyrarchyLoading } = useSelector(getSimulationLoadingStates) || {};
  // const isFetched = useRef(false);
  const theme = getTheme();
  const filters = useSelector(getSimulationDataBrowserFilters);

  // const [requestedModels, setRequestedModels] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const systemsList = simulationHierarchy?.["system-types"] || [];
  const modelsList = simulationHierarchy?.["model-types"] || [];
  const instanceNumberList = Array.from(Array(Number(simulationHierarchy?.["total-number-of-systems"]) || 0).keys());

  const mapSystemModelsNamesList = getMapSystemModelsList({ systemsList, modelsList });

  const setFilters = (filters: DataBrowserFilters) => dispatch(updateSimulationDataBrowserFilters(filters));

  useEffect(() => {
    if (externalFilters) setFilters(externalFilters);
  }, [externalFilters]);

  const refreshIntervalMs: number = useMemo(
    () => (simulationHierarchy?.["refresh-interval-seconds"] || 1) * 1000,
    [simulationHierarchy?.["refresh-interval-seconds"]],
  );

  const { timeData, systems, remoteServer, customData, sessionData, totalSystemsNum } = useMemo(
    () => ({
      timeData: simulationHierarchy?.["simulation-time-data"],
      systems: simulationHierarchy?.["simulation-systems"],
      remoteServer: simulationHierarchy?.["simulation-server-nodes"]?.[0],
      customData: simulationHierarchy?.["custom-simulation-data"],
      sessionData: simulationHierarchy?.["simulation-session-data"],
      totalSystemsNum: simulationHierarchy?.["total-number-of-systems"],
    }),
    [simulationHierarchy],
  );

  const selectedSystemIds = systemsList
    .filter((el) => filters.systemType.includes(el["system-type-name"]))
    .map((el) => el["system-type-id"]);
  const selectedModelIds = modelsList
    .filter((el) => filters.modelType.includes(el["model-type-name"]))
    .map((el) => el["model-type-id"]);

  const requestedSystems = selectedSystemIds.map(
    (id) => systems?.find((system) => system["system-type-id"] === id)?.["system-instance-name"] || "",
  );
  const requestedModels = selectedModelIds.map((id) => {
    const system =
      systems?.find((system) => system["system-models"].some((model) => model["model-type-id"] === id))?.[
        "system-instance-name"
      ] || "";
    const [_s, model] = (modelsList.find((model) => model["model-type-id"] === id)?.["model-type-name"] || "").split(
      "/",
    );

    return `${system}/${model}`;
  });

  const filterOptions: Record<string, FilterOption> = {
    systemType: {
      placeholder: "System Type",
      options: [...systemsList.map((el) => el["system-type-name"])],
    },
    modelType: {
      placeholder: "Model Type",
      options: [
        ...((filters.systemType as string[]).reduce(
          (acc, curr) => [...acc, ...mapSystemModelsNamesList[curr]],
          [] as string[],
        ) || []),
      ],
    },
    instanceNumber: {
      placeholder: "All instances",
      options: [...instanceNumberList.map(String)],
    },
  };

  const onFiltersChange = (key: DataBrowserFilterKey, event: any) => {
    let newValue;
    const textFields = ["caption", "search"];

    if (textFields.includes(key)) newValue = event.target.value;
    else newValue = event;

    setFilters({ ...filters, [key]: newValue });
  };

  // const hasMoreSystems = useMemo(
  //   () =>
  //     (systems?.length || 0) < (totalSystemsNum || 0) &&
  //     !filters.search &&
  //     !filters.systemType &&
  //     !filters.modelType &&
  //     !filters.instanceNumber,
  //   [systems?.length, totalSystemsNum],
  // );

  const mappedParams = useRef<string[]>([]);

  const mapModelDataItems = useCallback((items: ModelDataItem[], isFirstCall?: boolean): any[] => {
    if (isFirstCall) mappedParams.current = [];

    const filteredItems = items.filter(
      (item) =>
        item["param-outline-level"] === items[0]["param-outline-level"] &&
        !mappedParams.current.includes(item["param-path"]),
    );

    return filteredItems.map((item) => {
      mappedParams.current.push(item["param-path"]);

      const index = items.findIndex((x) => x["param-path"] === item["param-path"]);

      const nextItemIdx = items.findIndex(
        (x, idx) => idx > index && x["param-outline-level"] === item["param-outline-level"],
      );

      const endIdx = nextItemIdx === -1 ? items.length : nextItemIdx + 1;
      const units = item["param-data-units"] ? `[${item["param-data-units"]}]` : "";

      return {
        id: item["param-path"],
        title: item["param-data-name"],
        nonEditable: item["non-editable"],
        description: (
          <span>
            <span>{item["param-data-value"]}</span> &nbsp;<span>{units}</span>
          </span>
        ),
        children: mapModelDataItems(
          items.slice(index + 1, endIdx).filter((el) => el["param-outline-level"] > item["param-outline-level"]),
        ),
      };
    });
  }, []);

  const simulationData = useMemo(
    () => ({
      id: "simulation_data",
      title: "Simulation data",
      icon: <ComputerIcon />,
      children: [
        {
          id: "simulation_data-session_manager_data",
          title: "Session Manager Data",
          icon: <ServersIcon />,
          children: [
            {
              id: "simulation_data-session_manager-data_session-manager-connection-status",
              title: "Connection Status",
              description: timeData?.["session-manager-connection-status"],
            },
            {
              id: "simulation_data-session_manager-data_session-manager-status",
              title: "Session Manager Status",
              description: timeData?.["session-manager-status"],
            },
            {
              id: "simulation_data-session_manager-data_number-of-session-manager-errors",
              title: "Number of Errors and Fatals",
              description: timeData?.["number-of-session-manager-errors"],
            },
            {
              id: "simulation_data-session_manager-data_session-manager-up-time-seconds",
              title: "Up-Time (seconds)",
              description: timeData?.["session-manager-up-time-seconds"],
            },
            {
              id: "simulation_data-session_manager-data_session-manager-version-number",
              title: "Session Manager Version",
              description: timeData?.["session-manager-version-number"],
            },
            {
              id: "simulation_data-session_manager-data_session-manager-interface-version",
              title: "Session Manager Interface Version",
              description: timeData?.["session-manager-interface-version"],
            },
          ],
        },
        {
          id: "simulation_data-rest-server-data",
          title: "REST Server Data",
          icon: <ServersIcon />,
          children: [
            {
              id: "simulation_data-rest-server-data_rest-api-server-up-time-seconds",
              title: "Up-Time (seconds)",
              description: timeData?.["rest-api-server-up-time-seconds"],
            },
            {
              id: "simulation_data-rest-server-data_number-of-rest-server-errors",
              title: "Number of Errors and Fatals",
              description: timeData?.["number-of-rest-server-errors"],
            },
            {
              id: "simulation_data-rest-server-data_rest-api-server-version-number",
              title: "TCP server listening port for simulations",
              description: timeData?.["rest-server-listening-port-for-simulations"],
            },
            {
              id: "simulation_data-rest-server-data_rest-api-server-version-number",
              title: "REST server Version",
              description: timeData?.["rest-api-server-version-number"],
            },
            {
              id: "simulation_data-rest-server-data_rest-server-interface-version",
              title: "REST server interface version",
              description: timeData?.["rest-server-interface-version"],
            },
            {
              id: "simulation_data-rest-server-data_number-of-running-simulations",
              title: "Number of running simulations",
              description: timeData?.["number-of-running-simulations"],
            },
            {
              id: "simulation_data-rest-server-data_number-of-cached-users",
              title: "Number of cached users",
              description: timeData?.["number-of-cached-users"],
            },
            {
              id: "simulation_data-rest-server-data_number-of-cached-simulations",
              title: "Number of cached simulations",
              description: timeData?.["number-of-cached-simulations"],
            },
          ],
        },
        {
          id: "simulation_data-rest-web-ui-data",
          title: "Web UI Data",
          icon: <ServersIcon />,
          children: [
            {
              id: "simulation_data-rest-web-ui-data_web-ui-version-number",
              title: "Web UI Version",
              description: "Version 3.11.15 4-Jan-2026",
            },
            {
              id: "simulation_data-rest-web-ui-data_api_server_base_url",
              title: "API server base URL",
              description: process.env.REACT_APP_API_LINK,
            },
            {
              id: "simulation_data-rest-web-ui-data_google_maps_api_key",
              title: "Google API key",
              description: process.env.REACT_APP_GOOGLE_API_KEY,
            },
          ],
        },
        {
          id: "simulation_data-custom_data",
          title: "Custom Data",
          children: mapModelDataItems(customData || [], true),
        },
      ].filter((item) => filters.search.length < 4 || !IGNORE_WHILE_SEARCHING.includes(item.id)),
    }),
    [timeData, remoteServer, customData, sessionData, filters.search],
  );

  const systemsData = useMemo(
    () => ({
      id: "systems-data",
      title: "Systems",
      icon: <NetworkIcon />,
      children: systems?.map((item, l1Index) => ({
        id: `system-${item["system-instance-unique-id"]}`,
        title: item["system-instance-name"],
        icon: <NetworkIcon />,
        children: Object.entries(item)
          .filter(([key]) => key !== "system-instance-name")
          .map(([key, value], l2Index) => ({
            id: `system-${l1Index}-${l2Index}`,
            title: key,
            description: typeof value !== "object" ? String(value) : "",
            children:
              typeof value !== "object"
                ? []
                : value.map((el: Model, l3Index: number) => ({
                    id: `system_model-${el["model-instance-unique-id"]}`,
                    title: el["model-instance-name"],
                    icon: <ChipIcon />,
                    children: [
                      {
                        id: `system-${l1Index}-${l2Index}-${l3Index}-model_type`,
                        title: "model-type",
                        description: el["model-type"],
                      },
                      {
                        id: `system-${l1Index}-${l2Index}-${l3Index}-model_instance_unique_id`,
                        title: "model-instance-unique-id",
                        description: el["model-instance-unique-id"],
                      },
                      {
                        id: `system-${l1Index}-${l2Index}-${l3Index}-model_is_active`,
                        title: "model-is-active",
                        description: el["model-is-active"],
                      },
                      ...mapModelDataItems(el["model-data-items"] || [], true),
                    ],
                  })),
          })),
      })),
    }),
    [systems],
  );

  // const requestedSystems = useMemo(
  //   () => systems?.map((system) => system["system-instance-name"]),
  //   [systems, filters.search],
  // );

  const data = useMemo(() => [simulationData, systemsData], [simulationData, systemsData]);

  useEffect(() => {
    if (selectedSystemIds.length && selectedModelIds.length && filters.instanceNumber) {
      fetchDataDebounced({
        startIdx: 0,
        maxNum: 100,
        expand:
          filters.search.length >= 8 ||
          !!selectedSystemIds.length ||
          !!selectedModelIds.length ||
          !!filters.instanceNumber,
        searchQuery: filters.search as string,
        systemIds: selectedSystemIds,
        modelIds: selectedModelIds,
        substitudeData: !!filters.instanceNumber,
        instanceNumber: filters.instanceNumber as string,
      });
    } else {
      fetchDataDebounced({
        startIdx: 0,
        maxNum: 0,
        expand: false,
      });
      expandNodesDebounced([]);
    }
  }, [filters.search, selectedSystemIds.length, selectedModelIds.length, filters.instanceNumber]);

  useEffect(() => {
    if (filters.search.length >= 8 && selectedSystemIds.length && selectedModelIds.length && filters.instanceNumber)
      expandNodesDebounced(data);
  }, [filters.search, selectedSystemIds.length, selectedModelIds.length, filters.instanceNumber, data]);

  // useEffect(() => {
  //   if (!isFetched.current) {
  //     fetchDataDebounced({});
  //     isFetched.current = true;
  //   }
  // }, []);

  useEffect(() => {
    const timerId = setInterval(refreshData, refreshIntervalMs);
    return () => clearInterval(timerId);
  }, [refreshIntervalMs, requestedModels, filters.search]);

  const refreshData = useCallback(() => {
    dispatch(
      refreshSimulationDataServer({
        "simulation-session-id": sessionId,
        "search-term": filters.search.length >= 4 ? (filters.search as string) : "",
        "requested-systems": requestedSystems || [],
        "requested-models": requestedModels,
        "system-instance-number": filters.instanceNumber as string,
      }),
    );
  }, [sessionId, filters.search, requestedModels, requestedSystems, filters.instanceNumber]);

  const fetchDataDebounced = useCallback(
    debounce(
      ({
        maxNum = 100,
        startIdx = 0,
        expand = false,
        searchQuery = "",
        systemIds = [],
        modelIds = [],
        substitudeData = false,
        instanceNumber,
      }: FetchHyrarchyDataProps) => {
        dispatch(
          fetchSimulationHyrarchyServer({
            "simulation-session-id": sessionId,
            "max-number-of-systems-to-fetch": maxNum,
            "start-system-index": startIdx,
            "expand-model-data-items": expand,
            "search-term": searchQuery,
            "selected-system-type-ids": systemIds.join(","),
            "selected-model-type-ids": modelIds.join(","),
            "system-instance-number": instanceNumber,
            substitudeData,
          }),
        );
      },
      1000,
    ),
    [sessionId],
  );

  const handleSearchChange = useCallback((event: any) => {
    onFiltersChange("search", event);
  }, []);

  const handleNodeToggle = (_event: any, nodeIds: string[]) => {
    // const [id] =
    //   nodeIds.length > expandedNodes.length
    //     ? nodeIds.filter((x) => !expandedNodes.includes(x))
    //     : expandedNodes.filter((x) => !nodeIds.includes(x));

    setExpandedNodes(nodeIds);

    // if (id) {
    //   const system = systems?.find((system) => `system-${system["system-instance-unique-id"]}` === id);
    //   const systemIdx = systems?.findIndex((system) => `system-${system["system-instance-unique-id"]}` === id);
    //   if (system)
    //     fetchDataDebounced({
    //       maxNum: 1,
    //       startIdx: systemIdx,
    //       expand: true,
    //       searchQuery: filters.search as string,
    //       systemIds: selectedSystemIds,
    //       modelIds: selectedModelIds,
    //     });

    //   const models: Model[] = (systems || []).reduce(
    //     (acc: Model[], curr: System) => [...acc, ...curr["system-models"]],
    //     [],
    //   );
    //   const model = models.find((model) => `system_model-${model["model-instance-unique-id"]}` === id);

    //   if (model) {
    //     const path = model["model-path"];

    //     if (!requestedModels.includes(path)) setRequestedModels((prev) => [...prev, path]);
    //     else setRequestedModels((prev) => prev.filter((el) => el !== path));
    //   }
    // }
  };

  // const handleLoadMoreSystems = useCallback(() => {
  //   // const lastSystemIdx = (systems || []).slice(-1).pop()?.["system-index"] || 0;
  //   const lastSystemIdx = (systems?.length || 0) - 1;
  //   fetchDataDebounced({ startIdx: lastSystemIdx + 1 });
  // }, [systems]);

  const collectNodeIds = useCallback(
    (elements: any[]): string[] =>
      elements.reduce((acc, curr) => acc.concat([curr.id, ...collectNodeIds(curr.children || [])]), []),
    [],
  );

  const expandNodesDebounced = useCallback(
    debounce((elements: any[]) => {
      const nodeIds = collectNodeIds(elements);
      setExpandedNodes(nodeIds);
    }, 100),
    [],
  );

  return (
    <>
      <Seo title="Sim Data Browser" />
      {!hideHeaderActionElements && (
        <Box
          bgcolor={theme.palette.grey[600]}
          border={`1px solid ${theme.palette.grey[300]}`}
          borderRadius="10px"
          padding="16px"
        >
          <Typography variant="custom1" color="textColor.white" fontFamily="fontFamily">
            Data Dictionary Filters
          </Typography>
          <Box display="flex" gap="30px" marginTop={"16px"}>
            <FilterWrapper flex={1}>
              <Typography variant="body2" color="textColor.white" textTransform="capitalize">
                Search
              </Typography>
              <InputWrapper>
                <Input
                  fullWidth
                  placeholder="Search here"
                  value={filters?.search as string}
                  handleChange={(e) => onFiltersChange("search", e)}
                />
                <SearchIcon />
              </InputWrapper>
            </FilterWrapper>
            <Box display="flex" alignItems="center" gap="26px">
              {Object.keys(filterOptions)
                .filter((_k: string, idx) => idx < 2)
                .map((key: string, index) => (
                  <FilterWrapper key={index}>
                    <Typography
                      variant="body2"
                      color="textColor.white"
                      textTransform="capitalize"
                      sx={{ "& > b": { color: "red.400" } }}
                    >
                      {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                      <b>*</b>
                    </Typography>
                    <MultiSelect
                      options={filterOptions[key].options}
                      value={filters[key as "systemType" | "modelType"] as string[]}
                      placeholder={filterOptions[key].placeholder}
                      onChange={(e) => onFiltersChange(key, e)}
                      disabled={key === "modelType" && !filters.systemType}
                    />
                  </FilterWrapper>
                ))}
              <FilterWrapper>
                <Typography variant="body2" color="textColor.white" sx={{ "& > b": { color: "red.400" } }}>
                  System instance number<b>*</b>
                </Typography>
                <Select
                  options={filterOptions.instanceNumber.options}
                  value={filters.instanceNumber as string}
                  placeholder={filterOptions.instanceNumber.placeholder}
                  onChange={(e) => onFiltersChange("instanceNumber", e)}
                />
              </FilterWrapper>
            </Box>
          </Box>
        </Box>
      )}
      <DataTreeView
        data={data}
        sessionId={sessionId}
        expandedNodes={expandedNodes}
        // hasMoreSystems={hasMoreSystems}
        disableOverlay={disableOverlay}
        hideHeaderActionElements={hideHeaderActionElements}
        paramEditOnDlClick={paramEditOnDlClick}
        handleSearchChange={handleSearchChange}
        handleNodeToggle={handleNodeToggle}
        handleNodeSelect={handleNodeSelect}
        // handleLoadMoreSystems={handleLoadMoreSystems}
      />
    </>
  );
};

const InputWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  position: "relative",

  svg: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translate(0, -50%)",
  },

  ".MuiInputBase-input": {
    padding: "0 30px !important",
    height: "44px",
    fontSize: theme.typography.subtitle1.fontSize,
    color: theme.palette.main[100],

    "&::placeholder": {
      fontSize: theme.typography.subtitle1.fontSize,
      color: theme.palette.main[200],
    },
  },
}));

const FilterWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "100%",

  ".MuiFormControl-root": {
    maxWidth: "310px",
    width: "100%",
  },
});

export default withSimulation(SimulationDataBrowser);
