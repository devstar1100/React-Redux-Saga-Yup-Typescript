import { AnyAction, Dispatch } from "redux";

import { TableIcon } from "../components/Icons/TableIcon";
import { WidgetGeneralVars, WidgetUnit } from "../hocs/withAddWidget";
import {
  ChartRangeType,
  ChartType,
  CustomViewTableCell,
  CustomViewType,
  DataSetColor,
  DisplayElement,
  DisplayElementButton,
  DisplayElementButtonStatus,
  DisplayElementButtonType,
  DisplayElementGauge,
  DisplayElementMap,
  DisplayElementParameters,
  DisplayElementSimulationControl,
  DisplayElementSimulationControlStyle,
  DisplayElementStaticText,
  DisplayElementTable,
  DisplayElementType,
  DisplayElementXYChart,
  InternalLayoutType,
  MapIconType,
  ModelParameter,
} from "../types/customViews";
import { Popups } from "../types/popups";
import { updatePopup } from "../redux/actions/popupsActions";
import { AddWidgetPrefilledProps } from "../types/addWidgetPopupProps";
import { GaugeIcon } from "../components/Icons/GaugeIcon";
import { ChartIcon } from "../components/Icons/ChartIcon";
import { MapIcon } from "../components/Icons/MapIcon";
import { PlusButtonIcon } from "../components/Icons/PlusButtonIcon";
import { LogRecordsData, ModelType, Session, Simulation, SystemType } from "../types/simulations";
import { WidgetsList } from "../types/addWidget";
import SimulationControls from "../components/SimulationControls/SimulationControls";
import PieChartsWidget from "../components/PieChartsWidget/PieChartsWidget";
import MapWidget from "../components/MapWidget/MapWidget";
import ConsoleWidget from "../components/ConsoleWidget/ConsoleWidget";
import ChartWidget from "../components/ChartWidget/ChartWidget";
import TableWidget from "../components/TableWidget/TableWidget";
import ButtonsWidget from "../components/ButtonsWidget/ButtonsWidget";
import { formEventTargetModel } from "./formEventTargetModel";
import { updateCustomViewData, updateCustomViewLayoutServer } from "../redux/actions/customViewActions";
import { ScenarioFile } from "../types/scenarioFile";

const formParameterFromUnit = (unit: WidgetUnit, index: number): ModelParameter & Record<string, string | number> => ({
  "parameter-order": index,
  "parameter-name": unit["parameter-name"],
  "parameter-units": unit["parameter-units"],
  "parameter-value": "",
  "parameter-path": unit["parameter-path"],
  "system-model": unit["system-model"],
  "parameter-scale": unit["parameter-scale"],
});

const getOrdinalDataSetColor = (index: number): DataSetColor =>
  Object.keys(DataSetColor)[index % Object.keys(DataSetColor).length] as DataSetColor;

export const retrieveSystemModelFromPath = (parameterPath: string) =>
  parameterPath.split("/").slice(0, 2).join("/").split(":")[0];

export const generateNewWidgetTemplate = (
  type: DisplayElementType,
  widgetUnits: WidgetUnit[],
  generalVars: WidgetGeneralVars,
  additionalData: Record<string, any>,
) =>
  ({
    [DisplayElementType.table]: {
      "table-data": [
        {
          "display-table-header": true,
          "model-parameters": widgetUnits.map(formParameterFromUnit),
        },
      ] as DisplayElementTable[],
    },
    [DisplayElementType.gauges]: {
      "gauges-data": widgetUnits.map((unit, idx) => ({
        "model-parameter-data": [formParameterFromUnit(unit, idx)],
        "gauge-css-type": unit["parameter-name"],
        "gauge-color": getOrdinalDataSetColor(idx),
        "gauge-maximum-value": Number(unit["gauge-maximum-value"]),
      })) as DisplayElementGauge[],
    },
    [DisplayElementType.chart]: {
      "chart-data": [
        {
          "chart-x-axis-label": generalVars["chart-x-axis-label"] || "X",
          "chart-y-axis-label": generalVars["chart-y-axis-label"] || "Y",
          "chart-x-axis-range-type": Object.keys(ChartRangeType)[+(generalVars["chart-x-axis-range-type"] === "false")],
          "chart-y-axis-range-type": Object.keys(ChartRangeType)[+(generalVars["chart-y-axis-range-type"] === "false")],
          "chart-min-x-axis-value": Number(generalVars["chart-min-x-axis-value"]),
          "chart-max-x-axis-value": Number(generalVars["chart-max-x-axis-value"]),
          "chart-min-y-axis-value": Number(generalVars["chart-min-y-axis-value"]),
          "chart-max-y-axis-value": Number(generalVars["chart-max-y-axis-value"]),
          // "chart-type": generalVars["chart-type"] as ChartType,
          "chart-type": ChartType.lineChart,
          "chart-aspect-ratio": Number(generalVars["chart-aspect-ratio"]) || 2,
          "chart-history-size": Number(generalVars["chart-history-size"]) || 500,
          "chart-step-interval": Number(generalVars["chart-step-interval"]) || 1,
          "x-axis-data-parameter": widgetUnits.length ? formParameterFromUnit(widgetUnits[0], 0) : {},
          "y-axis-data-parameters": widgetUnits.slice(1).map(formParameterFromUnit),
          "chart-data": widgetUnits.map((unit) => ({
            "data-set-color": unit["data-set-color"],
            "x-data-set-path": widgetUnits[0]["parameter-path"],
            "y-data-set-name": unit["parameter-name"],
            "y-parameter-path": unit["parameter-path"],
            "x-values": [],
            "y-values": [],
            "system-model": unit["system-model"],
            "parameter-data-set": unit["parameter-data-set"],
            "parameter-units": unit["parameter-units"],
            "parameter-scale": unit["parameter-scale"],
          })),
        },
      ] as DisplayElementXYChart[],
    },
    [DisplayElementType.map]: {
      "map-data": [
        {
          "data-point-captions": widgetUnits.map((unit) => unit["name"] || "point 1"),
          "initial-zoom-level": Number(generalVars["initial-zoom-level"]) || 1,
          "chart-source": generalVars["chart-source"] || "Google maps",
          "icon-type": (generalVars["icon-type"] || MapIconType.aircraft) as MapIconType,
          "is-auto-map-center": generalVars["is-auto-map-center"] === "true",
          "central-latitude": Number(generalVars["central-latitude"]) || -1000,
          "central-longitude": Number(generalVars["central-longitude"]) || 1000,
          "latitude-data-points-degrees": widgetUnits.map((unit, idx) => ({
            "parameter-order": idx,
            "parameter-name": unit["name"],
            "parameter-units": unit["units"],
            "parameter-value": "",
            "parameter-path": unit["latitude-parameter-path"],
            "system-model": unit["system-model"],
          })),
          "longitude-data-points-degrees": widgetUnits.map((unit, idx) => ({
            "parameter-order": idx,
            "parameter-name": unit["name"],
            "parameter-units": unit["units"],
            "parameter-value": "",
            "parameter-path": unit["longitude-parameter-path"],
            "system-model": unit["system-model"],
          })),
        },
      ] as DisplayElementMap[],
    },
    [DisplayElementType.buttons]: {
      "buttons-data": widgetUnits.map((unit, idx) => ({
        "button-id": idx,
        "button-index-in-cell": idx,
        "button-icon": unit["button-icon"],
        "button-caption": unit["button-caption"],
        "button-status": DisplayElementButtonStatus.unPressed,
        // "button-type": unit["button-type"],
        "button-type": DisplayElementButtonType.pushButton,
        "button-color": getOrdinalDataSetColor(idx),
        "action-key": unit["action-key"],
        "scenario-file-name": unit["scenario-file-name"],
        //"scenario-file-id": additionalData["scenario-files"].find(
        //  (el: ScenarioFile) => el["scenario-file-name"] === unit["scenario-file-name"],
        //)?.["scenario-file-id"],
      })) as DisplayElementButton[],
    },
    [DisplayElementType.simulationControlWidget]: {
      "simulation-control-data": {
        "simulation-control-style": generalVars["simulation-control-style"] as DisplayElementSimulationControlStyle,
      } as DisplayElementSimulationControl,
    },
    [DisplayElementType.simulationLogWidget]: {},
    [DisplayElementType.staticText]: {
      "static-text-data": {
        "text-value": generalVars["text-value"],
        "text-css-style": generalVars["text-css-style"],
      } as DisplayElementStaticText,
    },
    [DisplayElementType.dataValues]: {
      "parameters-data": [
        {
          "model-parameter-data": widgetUnits.map(formParameterFromUnit),
          "data-css-type": generalVars["data-css-type"],
        },
      ] as DisplayElementParameters[],
    },
  }[type]);

export const getWidgetsList = (
  dispatch: Dispatch<AnyAction>,
  simulation?: Simulation,
  sessionId?: string,
  customView?: CustomViewType,
): WidgetsList => [
  {
    icon: <TableIcon />,
    title: "Add Table",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      dispatch(
        updatePopup({
          popup: Popups.addTable,
          status: true,
          prefilled: {
            simulationId: Number(simulation?.["simulation-id"]),
            sessionId: Number(sessionId),
            customViewId: Number(customView?.["custom-view-id"]),
            targetRowIdx: rowIdx,
            targetColIdx: colIdx,
            order,
            isNewWidget: true,
          } as AddWidgetPrefilledProps,
        }),
      ),
  },
  {
    icon: <GaugeIcon />,
    title: "Add Gauge",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      dispatch(
        updatePopup({
          popup: Popups.addGauge,
          status: true,
          prefilled: {
            simulationId: Number(simulation?.["simulation-id"]),
            sessionId: Number(sessionId),
            customViewId: Number(customView?.["custom-view-id"]),
            targetRowIdx: rowIdx,
            targetColIdx: colIdx,
            order,
            isNewWidget: true,
          } as AddWidgetPrefilledProps,
        }),
      ),
  },
  {
    icon: <ChartIcon />,
    title: "Add Chart",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      dispatch(
        updatePopup({
          popup: Popups.addChart,
          status: true,
          prefilled: {
            simulationId: Number(simulation?.["simulation-id"]),
            sessionId: Number(sessionId),
            customViewId: Number(customView?.["custom-view-id"]),
            targetRowIdx: rowIdx,
            targetColIdx: colIdx,
            order,
            isNewWidget: true,
          } as AddWidgetPrefilledProps,
        }),
      ),
  },
  {
    icon: <MapIcon />,
    title: "Add Map",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      dispatch(
        updatePopup({
          popup: Popups.addMap,
          status: true,
          prefilled: {
            simulationId: Number(simulation?.["simulation-id"]),
            sessionId: Number(sessionId),
            customViewId: Number(customView?.["custom-view-id"]),
            targetRowIdx: rowIdx,
            targetColIdx: colIdx,
            order,
            isNewWidget: true,
          } as AddWidgetPrefilledProps,
        }),
      ),
  },
  {
    icon: <PlusButtonIcon />,
    title: "Add Buttons",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      dispatch(
        updatePopup({
          popup: Popups.addButton,
          status: true,
          prefilled: {
            simulationId: Number(simulation?.["simulation-id"]),
            sessionId: Number(sessionId),
            customViewId: Number(customView?.["custom-view-id"]),
            targetRowIdx: rowIdx,
            targetColIdx: colIdx,
            order,
            isNewWidget: true,
          } as AddWidgetPrefilledProps,
        }),
      ),
  },
  {
    icon: <PlusButtonIcon />,
    title: "Add Simulation control",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      createSimpleWidgetElement(
        DisplayElementType.simulationControlWidget,
        dispatch,
        rowIdx,
        colIdx,
        order,
        simulation as Simulation,
        customView as CustomViewType,
      ),
  },
  {
    icon: <PlusButtonIcon />,
    title: "Add Simulation log",
    getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () =>
      createSimpleWidgetElement(
        DisplayElementType.simulationLogWidget,
        dispatch,
        rowIdx,
        colIdx,
        order,
        simulation as Simulation,
        customView as CustomViewType,
      ),
  },
];

const createSimpleWidgetElement = (
  elementType: DisplayElementType,
  dispatch: Dispatch<AnyAction>,
  rowIdx: number,
  colIdx: number,
  order: number,
  simulation: Simulation,
  customView: CustomViewType,
) => {
  const currentCell = customView?.["view-table-cells"].find(
    (el) => el["custom-view-cell-row-index"] == rowIdx && el["custom-view-cell-column-index"] === colIdx,
  ) as CustomViewTableCell;

  const currentWidget = currentCell?.["display-section-elements"].find(
    (el) => el["display-order-within-layout-section"] === order,
  ) as DisplayElement;

  const lastId: number = (customView?.["view-table-cells"] || [])
    .reduce((acc, curr) => [...acc, ...curr["display-section-elements"]], [] as DisplayElement[])
    .reduce((acc, curr) => (curr["display-element-id"] > acc ? curr["display-element-id"] : acc), 0);

  const initialDisplayElement: DisplayElement = {
    "display-element-id": lastId + 1,
    "display-element-caption": `new ${elementType}`,
    "display-element-type": elementType,
    "internal-layout": InternalLayoutType.horizontal,
    "display-order-within-layout-section": currentWidget?.["display-order-within-layout-section"] || 0,
    "table-data": [],
    "buttons-data": [],
    "gauges-data": [],
    "parameters-data": [],
    "static-text-data": {} as DisplayElementStaticText,
    "simulation-control-data": {} as DisplayElementSimulationControl,
    "chart-data": [],
    "map-data": [],
  };

  const newDisplayElement: DisplayElement = {
    ...initialDisplayElement,
    ...generateNewWidgetTemplate(elementType, [], {}, {}),
  };

  let nextWidgetsList: DisplayElement[] = currentCell?.["display-section-elements"] || [];

  const updatedWidgetsList: DisplayElement[] = (currentCell?.["display-section-elements"] || []).map((el) =>
    el["display-order-within-layout-section"] >= order
      ? { ...el, "display-order-within-layout-section": el["display-order-within-layout-section"] + 1 }
      : el,
  );

  nextWidgetsList = [...updatedWidgetsList, newDisplayElement].sort(
    (a, b) => a["display-order-within-layout-section"] - b["display-order-within-layout-section"],
  );

  const nextCell: CustomViewTableCell = { ...currentCell, "display-section-elements": nextWidgetsList };

  const nextCellsList: CustomViewTableCell[] = (customView?.["view-table-cells"] || []).map((el) =>
    el["custom-view-cell-row-index"] == rowIdx && el["custom-view-cell-column-index"] === colIdx ? nextCell : el,
  );

  const nextCustomView = { ...(customView as CustomViewType), "view-table-cells": nextCellsList };

  dispatch(updateCustomViewData(nextCustomView));

  dispatch(
    updateCustomViewLayoutServer({
      "simulation-id": Number(simulation?.["simulation-id"]),
      "custom-view-id": Number(customView?.["custom-view-id"]),
      nextData: nextCustomView,
    }),
  );
};

export const getWidgetComponent = (
  element: DisplayElement,
  simulation?: Simulation,
  displaySessionInfo?: Session,
  customView?: CustomViewType,
  logRecords?: LogRecordsData,
  customViewIdFromUri?: number,
) => {
  const type = element["display-element-type"];
  const id = element["display-element-id"];
  switch (type) {
    case DisplayElementType.simulationControlWidget:
      return simulation && displaySessionInfo ? (
        <SimulationControls
          simulationId={simulation["simulation-id"]}
          speed={displaySessionInfo["simulation-execution-speed"]}
          runMode={displaySessionInfo["simulation-run-mode"]}
          sessionId={displaySessionInfo["simulation-session-id"]}
          sessionStatus={displaySessionInfo["simulation-session-status"]}
          elementId={id}
        />
      ) : null;
    case DisplayElementType.gauges:
      return (
        <PieChartsWidget
          engines={element["gauges-data"]}
          title={element["display-element-caption"]}
          layout={element["internal-layout"]}
          elementId={id}
        />
      );
    case DisplayElementType.map:
      return <MapWidget mapData={element["map-data"]} title={element["display-element-caption"]} elementId={id} />;
    case DisplayElementType.simulationLogWidget:
      return <ConsoleWidget logs={logRecords?.["log-records"]} elementId={id} />;
    case DisplayElementType.staticText:
      return <h3 style={{ padding: "30px" }}>'static-text' element marker</h3>;
    case DisplayElementType.dataValues:
      return <h3 style={{ padding: "30px" }}>'data-values' element marker</h3>;
    case DisplayElementType.chart:
      return (
        <ChartWidget chartData={element["chart-data"]} title={element["display-element-caption"]} elementId={id} />
      );
    case DisplayElementType.table:
      return (
        <TableWidget
          {...element["table-data"][0]}
          {...{
            "display-element-caption": element["display-element-caption"],
            "simulation-session-id": Number(displaySessionInfo?.["simulation-session-id"]),
          }}
          elementId={id}
        />
      );
    case DisplayElementType.buttons:
      return displaySessionInfo && customView ? (
        <ButtonsWidget
          elementTitle={element["display-element-caption"]}
          sessionId={displaySessionInfo["simulation-session-id"]}
          customViewId={customViewIdFromUri ?? 1}
          buttons={element["buttons-data"]}
          layout={element["internal-layout"]}
          elementId={id}
        />
      ) : null;
    default:
      return null;
  }
};
