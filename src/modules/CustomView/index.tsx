import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid, styled, Box } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

import Seo from "../../components/Seo";
import {
  getCustomViewDataServer,
  refreshCustomViewDataServer,
  updateCustomViewData,
  updateCustomViewLayoutServer,
  updateIsCustomViewEditMode,
} from "../../redux/actions/customViewActions";
import {
  getCurrentCustomView,
  getIsCustomViewEditMode,
  getIsCustomViewLoading,
} from "../../redux/reducers/customViewReducer";
import withSimulation, { fetchLogRecordsHelper } from "../../hocs/withSimulation";
import { CustomViewType, DisplayElementType } from "../../types/customViews";
import {
  getCurrentSimulation,
  getLogRecords,
  getSessionInformation,
  getSimulationLoadingStates,
} from "../../redux/reducers/simulationReducer";
import PageLoader from "../../components/PageLoader";
import { getColumnId, getRowId, getWidgetId } from "../../lib/customViewUtils";
import Button from "../../components/Button";
import BigPlusIcon from "../../components/Icons/BigPlusIcon";
import { Simulation } from "../../types/simulations";
import ActionsModal from "../../components/Modals/ActionsModal";
import { ActionsList } from "../../types/actions";
import { getWidgetComponent, getWidgetsList } from "../../lib/addWidgetUtils";
import { getScenarioFilesServer } from "../../redux/actions/scenarioFilesActions";

const CustomView = () => {
  const dispatch = useDispatch();
  const simulation = useSelector(getCurrentSimulation);
  const customView = useSelector(getCurrentCustomView);
  const logRecords = useSelector(getLogRecords);
  const sessionInformation = useSelector(getSessionInformation);
  const isLoading = useSelector(getIsCustomViewLoading);
  const { isSimulationDataLoading } = useSelector(getSimulationLoadingStates) || {};
  const { sessionId, customViewId } = useParams();
  const isDataFetched = useRef(false);
  const isEditMode = useSelector(getIsCustomViewEditMode);

  const widgetsList = useMemo(
    () => getWidgetsList(dispatch, simulation, sessionId, customView),
    [dispatch, simulation, sessionId, customViewId],
  );

  const [isWidgetsListOpen, setIsWidgetsListOpen] = useState<{ [key: string]: boolean }>({});

  const displaySessionInfo = sessionInformation || simulation?.["default-session-information"];
  const refreshIntervalMs: number = (customView?.["refresh-interval-seconds"] || 1) * 1000;

  const maxColsNum = customView?.["maximum-number-of-columns"] || 0;
  const maxRowsNum = customView?.["maximum-number-of-rows"] || 0;

  useEffect(() => {
    if (!isDataFetched.current && sessionId && customViewId) {
      dispatch(getCustomViewDataServer({ "simulation-session-id": +sessionId, "custom-view-id": +customViewId }));
      dispatch(getScenarioFilesServer((simulation as Simulation)["simulation-id"]));
      isDataFetched.current = true;
    }
  }, [sessionId, customViewId]);

  useEffect(() => {
    if (isDataFetched.current && sessionId && customViewId)
      dispatch(getCustomViewDataServer({ "simulation-session-id": +sessionId, "custom-view-id": +customViewId }));
  }, [sessionId, customViewId]);

  useEffect(() => {
    if (isDataFetched.current && sessionId && customViewId && !isEditMode) {
      const timerId = setInterval(() => {
        dispatch(refreshCustomViewDataServer({ "simulation-session-id": +sessionId, "custom-view-id": +customViewId }));
        fetchLogRecordsHelper({ dispatchFunc: dispatch, logRecords, sessionId });
      }, refreshIntervalMs);

      return () => clearInterval(timerId);
    }
  }, [sessionId, customViewId, logRecords, isEditMode]);

  useEffect(() => {
    return () => {
      dispatch(updateIsCustomViewEditMode(false));
    };
  }, []);

  const convertWidgetsListFormat = (
    list: typeof widgetsList,
    rowIdx: number,
    colIdx: number,
    order: number,
  ): ActionsList =>
    list.map(({ getHandlerFunc, ...rest }) => ({ ...rest, handlerFunc: getHandlerFunc(rowIdx, colIdx, order) }));

  const getOpenWidgtesModalFunc = (key: string) => () => setIsWidgetsListOpen((prev) => ({ ...prev, [key]: true }));

  const getCloseWidgtesModalFunc = (key: string) => () => setIsWidgetsListOpen((prev) => ({ ...prev, [key]: false }));

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const srcCol = customView?.["view-table-cells"].find(
      (col) =>
        getColumnId(col["custom-view-cell-row-index"], col["custom-view-cell-column-index"]) === source.droppableId,
    );

    const dstCol = customView?.["view-table-cells"].find(
      (col) =>
        getColumnId(col["custom-view-cell-row-index"], col["custom-view-cell-column-index"]) ===
        destination.droppableId,
    );

    if (customView && srcCol && dstCol) {
      const srcId = getColumnId(srcCol["custom-view-cell-row-index"], srcCol["custom-view-cell-column-index"]);
      const dstId = getColumnId(dstCol["custom-view-cell-row-index"], dstCol["custom-view-cell-column-index"]);

      let newData: CustomViewType = { ...customView };

      if (srcId !== dstId) {
        const newSrcWidgets = Array.from(srcCol["display-section-elements"]);
        const [relocatedWidget] = newSrcWidgets.splice(source.index, 1);

        const newDstWidgets = Array.from(dstCol["display-section-elements"]);
        newDstWidgets.splice(destination.index, 0, relocatedWidget);

        const newSrcCol = {
          ...srcCol,
          "display-section-elements": newSrcWidgets,
        };
        const newDstCol = {
          ...dstCol,
          "display-section-elements": newDstWidgets,
        };

        newData = {
          ...customView,
          "view-table-cells": customView["view-table-cells"].map((col) => {
            const colId = getColumnId(col["custom-view-cell-row-index"], col["custom-view-cell-column-index"]);

            if (colId == srcId) return newSrcCol;
            if (colId === dstId) return newDstCol;

            return col;
          }),
        };
      } else {
        const newSrcWidgets = Array.from(srcCol["display-section-elements"]);
        const [relocatedWidget] = newSrcWidgets.splice(source.index, 1);
        newSrcWidgets.splice(destination.index, 0, relocatedWidget);

        const newSrcCol = {
          ...srcCol,
          "display-section-elements": newSrcWidgets,
        };

        newData = {
          ...customView,
          "view-table-cells": customView["view-table-cells"].map((col) =>
            getColumnId(col["custom-view-cell-row-index"], col["custom-view-cell-column-index"]) === srcId
              ? newSrcCol
              : col,
          ),
        };
      }

      dispatch(updateCustomViewData(newData));

      dispatch(
        updateCustomViewLayoutServer({
          "simulation-id": (simulation as Simulation)["simulation-id"],
          "custom-view-id": customView["custom-view-id"],
          nextData: newData,
        }),
      );
    }
  };

  return (
    <>
      <Seo title={customView?.["custom-view-caption"] || "Custom view"} />
      <Wrapper container>
        {!isLoading && !isSimulationDataLoading ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Grid container flexDirection={"column"}>
              {Array.from(Array(maxRowsNum).keys()).map((rowIdx: number) => {
                const columns =
                  customView?.["view-table-cells"]
                    .filter((column) => column["custom-view-cell-row-index"] === rowIdx)
                    .slice(0, maxColsNum) || [];

                return (
                  <Grid key={getRowId(rowIdx)} flex={1} container flexDirection="row" alignItems="stretch">
                    {columns.map((column) => (
                      <Droppable
                        key={getColumnId(rowIdx, column["custom-view-cell-column-index"])}
                        droppableId={getColumnId(rowIdx, column["custom-view-cell-column-index"])}
                        isDropDisabled={!isEditMode}
                      >
                        {(droppableProvided, snapshot) => (
                          <Grid
                            ref={droppableProvided.innerRef}
                            {...droppableProvided.droppableProps}
                            style={{ width: `${100 / maxColsNum}%`, flex: 1 }}
                            display="flex"
                            flexDirection="column"
                            gap="12px"
                            border={
                              isEditMode
                                ? snapshot.isDraggingOver
                                  ? "1px dashed #faa21d"
                                  : "1px dashed #62A6FF"
                                : "medium none color"
                            }
                            padding="12px 10px"
                            minHeight="400px"
                          >
                            {!column["display-section-elements"].length && isEditMode && (
                              <Box position="relative" sx={{ margin: "auto" }}>
                                <Button
                                  color="blue"
                                  icon={<BigPlusIcon />}
                                  onClick={getOpenWidgtesModalFunc(
                                    `${column["custom-view-cell-row-index"]}_${column["custom-view-cell-column-index"]}_widget`,
                                  )}
                                  sx={{ margin: "auto" }}
                                >
                                  Add New Display element
                                </Button>
                                <WidgetsListWrapper>
                                  <ActionsModal
                                    actionsList={convertWidgetsListFormat(
                                      widgetsList,
                                      column["custom-view-cell-row-index"],
                                      column["custom-view-cell-column-index"],
                                      0,
                                    )}
                                    isActive={
                                      !!isWidgetsListOpen[
                                        `${column["custom-view-cell-row-index"]}_${column["custom-view-cell-column-index"]}_widget`
                                      ]
                                    }
                                    onClose={getCloseWidgtesModalFunc(
                                      `${column["custom-view-cell-row-index"]}_${column["custom-view-cell-column-index"]}_widget`,
                                    )}
                                  />
                                </WidgetsListWrapper>
                              </Box>
                            )}
                            {column["display-section-elements"].map((widget, index) => (
                              <Draggable
                                key={getWidgetId(widget["display-element-id"])}
                                draggableId={getWidgetId(widget["display-element-id"])}
                                index={index}
                                isDragDisabled={!isEditMode}
                              >
                                {(provided, snapshot) => (
                                  <Grid
                                    flex={widget["display-element-type"] === DisplayElementType.map ? 1 : "0 1 auto"}
                                    maxWidth="100%"
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    rowGap="12px"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {isEditMode && (
                                      <Box position="relative">
                                        <Button
                                          color="blue"
                                          icon={<BigPlusIcon />}
                                          disabled={snapshot.isDragging}
                                          onClick={getOpenWidgtesModalFunc(getWidgetId(widget["display-element-id"]))}
                                        >
                                          Add New Display element
                                        </Button>
                                        <WidgetsListWrapper>
                                          <ActionsModal
                                            actionsList={convertWidgetsListFormat(
                                              widgetsList,
                                              column["custom-view-cell-row-index"],
                                              column["custom-view-cell-column-index"],
                                              widget["display-order-within-layout-section"],
                                            )}
                                            isActive={!!isWidgetsListOpen[getWidgetId(widget["display-element-id"])]}
                                            onClose={getCloseWidgtesModalFunc(
                                              getWidgetId(widget["display-element-id"]),
                                            )}
                                          />
                                        </WidgetsListWrapper>
                                      </Box>
                                    )}
                                    <Box
                                      width="100%"
                                      flex={widget["display-element-type"] === DisplayElementType.map ? 1 : "0 1 auto"}
                                    >
                                      {getWidgetComponent(
                                        widget,
                                        simulation,
                                        displaySessionInfo,
                                        customView,
                                        logRecords,
                                        Number(customViewId),
                                      )}
                                    </Box>
                                  </Grid>
                                )}
                              </Draggable>
                            ))}
                            {droppableProvided.placeholder}
                          </Grid>
                        )}
                      </Droppable>
                    ))}
                  </Grid>
                );
              })}
            </Grid>
          </DragDropContext>
        ) : (
          <Box width="100%" height="100%" p="200px 0">
            <PageLoader />
          </Box>
        )}
      </Wrapper>
    </>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  flexWrap: "nowrap",
  marginTop: "-15px",

  "& .mapContainer": {
    height: "100%",
    minHeight: "500px",
    flex: 1,
  },

  [theme.breakpoints.down(1201)]: {
    flexWrap: "wrap",
  },
}));

const WidgetsListWrapper = styled(Box)(() => ({
  position: "absolute",
  left: 0,
  top: "calc(100% + 15px)",
}));

export default withSimulation(CustomView);
