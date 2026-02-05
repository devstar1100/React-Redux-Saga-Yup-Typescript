import { TimeInformation } from "./simulations";

export interface CustomViewType {
  "custom-view-id": number;
  "custom-view-caption": string;
  "refresh-interval-seconds"?: number;
  "custom-view-menu-index": number;
  "is-default-screen": boolean;
  "maximum-number-of-columns": number;
  "maximum-number-of-rows": number;
  "custom-view-grid-template-id": number;
  "custom-view-grid-template-name": GridTemplateName;
  "creation-date": string;
  "last-update-date": string;
  "is-custom-view-active": boolean;
  "view-table-cells": CustomViewTableCell[];
  "simulation-id": number;
  "simulation-name": string;
}

export interface CustomViewTableCell {
  "custom-view-cell-description": string;
  "custom-view-cell-row-index": number;
  "custom-view-cell-column-index": number;
  "custom-view-cell-column-span": number;
  "display-section-elements": DisplayElement[];
}

export interface DisplayElementCaption {
  "display-element-caption": string;
}

export interface DisplayElement extends DisplayElementCaption {
  "display-element-id": number;
  "display-element-type": DisplayElementType;
  "internal-layout": InternalLayoutType;
  "display-order-within-layout-section": number;
  "buttons-data": DisplayElementButton[];
  "gauges-data": DisplayElementGauge[];
  "parameters-data": DisplayElementParameters[];
  "static-text-data": DisplayElementStaticText;
  "simulation-control-data": DisplayElementSimulationControl;
  "table-data": DisplayElementTable[];
  "chart-data": DisplayElementXYChart[];
  "map-data": DisplayElementMap[];
}

export interface DisplayElementButton {
  "button-id": number;
  "button-index-in-cell": number;
  "button-icon": MapIconType;
  "button-caption": string;
  "button-status": DisplayElementButtonStatus;
  "button-type": DisplayElementButtonType;
  "button-color": DataSetColor;
  "event-target-model": string;
  "event-enum": number;
  "action-key": string;
  "system-type-name": string;
  "system-index": number;
  "model-type-name": string;
  "model-index": number;
  "scenario-file-name": string;
  "scenario-file-id": number;
}

export interface DisplayElementGauge {
  "model-parameter-data": ModelParameter[];
  "gauge-css-type": string;
  "gauge-color": DataSetColor;
  "gauge-maximum-value": number;
}

export interface DisplayElementParameters {
  "model-parameter-data": ModelParameter[];
  "data-css-type": string;
}

export interface DisplayElementStaticText {
  "text-value": string;
  "text-css-style": string;
}

export interface DisplayElementSimulationControl {
  "simulation-control-style": DisplayElementSimulationControlStyle;
}

export interface DisplayElementTable {
  "display-table-header": boolean;
  "model-parameters": ModelParameter[];
}

export interface DisplayElementMap {
  "data-point-captions": string[];
  "chart-source": string;
  "initial-zoom-level": number;
  "icon-type": MapIconType;
  "is-auto-map-center": boolean;
  "central-latitude": number;
  "central-longitude": number;
  "latitude-data-points-degrees": ModelParameter[];
  "longitude-data-points-degrees": ModelParameter[];
}

export enum DisplayElementType {
  simulationControlWidget = "simulation-control-widget",
  simulationLogWidget = "simulation-log-widget",
  staticText = "static-text",
  dataValues = "data-values",
  table = "table",
  gauges = "gauges",
  chart = "chart",
  map = "map",
  buttons = "buttons",
}

export enum InternalLayoutType {
  horizontal = "horizontal",
  vertical = "vertical",
  fillElement = "fill-element",
}

export enum DisplayElementButtonStatus {
  disabled = "disabled",
  pressed = "pressed",
  unPressed = "un-pressed",
}

export enum ButtonActionType {
  click = "click",
  press = "press",
  release = "release",
}

export enum DisplayElementButtonType {
  pushButton = "push-button",
  switchButton = "switch-button",
}

export enum DisplayElementSimulationControlStyle {
  wideSimulationControlWidget = "wide-simulation-control-widget",
  narrowSimulationControlWidge = "narrow-simulation-control-widge",
}

export enum MapIconType {
  aircraft = "aircraft",
  satellite = "satellite",
  car = "car",
  circle = "circle",
  box = "box",
}

export interface ModelParameter {
  "parameter-order": number;
  "parameter-name": string;
  "parameter-units": string;
  "parameter-value": number | "";
  "parameter-path": string;
}

export interface DisplayElementXYChart {
  "chart-x-axis-label": string;
  "chart-y-axis-label": string;
  "chart-x-axis-range-type": ChartRangeType;
  "chart-y-axis-range-type": ChartRangeType;
  "chart-min-x-axis-value": number;
  "chart-max-x-axis-value": number;
  "chart-min-y-axis-value": number;
  "chart-max-y-axis-value": number;
  "chart-type": ChartType;
  "chart-aspect-ratio": number;
  "chart-history-size": number;
  "chart-step-interval": number;
  "x-axis-data-parameter": ModelParameter;
  "y-axis-data-parameters": ModelParameter[];
  "chart-data": XyChartDataSet[];
}

export interface XyChartDataSet {
  "data-set-color": DataSetColor;
  "x-data-set-path": string;
  "y-data-set-name": string;
  "y-parameter-path": string;
  "x-values": number[];
  "y-values": number[];
}

export interface CustomViewBasicRefreshData {
  "custom-view-id": number;
  "custom-view-caption": string;
  "refresh-interval-seconds": number;
  "simulation-time-information": TimeInformation;
}

export interface CustomViewDetailedRefreshData {
  "display-element-data-item-values": {
    "display-element-id": number;
    "parameter-path": string;
    "parameter-value": string;
  }[];
  "display-element-data-item-array-values": {
    "display-element-id": number;
    "x-data-set-path": string;
    "y-data-set-path": string;
    "x-values": number[];
    "y-values": number[];
  }[];
  "display-element-button-statuses": {
    "display-element-id": number;
    "button-id": number;
    "button-caption": string;
    "button-status": DisplayElementButtonStatus;
  }[];
}

export interface CustomViewGridTemplate {
  "creation-date": string;
  "custom-view-grid-template-id": number;
  "custom-view-grid-template-name": GridTemplateName;
  "last-update-date": string;
  "maximum-number-of-columns": number;
  "maximum-number-of-rows": number;
  "thumbnail-path": string;
}

export enum GridTemplateName {
  oneColumnGrid = "one-column-grid",
  twoColumnGrid = "two-column-grid",
  threeColumnGrid = "three-column-grid",
  fourColumnGrid = "four-column-grid",
}

export enum ChartRangeType {
  manual = "manual",
  auto = "auto",
}

export enum DataSetColor {
  blue300 = "blue-300",
  green300 = "green-300",
  red400 = "red-400",
  yellow400 = "yellow-400",
  violet400 = "violet-400",
  liteBlue300 = "lite-blue-300",
  grey100 = "grey-100",
  grey200 = "grey-200",
  white = "white",
}

export enum ChartType {
  lineChart = "line-chart",
  barChart = "bar-chart",
  pointChart = "point-chart",
  map = "map",
}

export const ChartTypeName: Record<ChartType, string> = {
  [ChartType.lineChart]: "Line chart",
  [ChartType.barChart]: "Bar chart",
  [ChartType.pointChart]: "Point chart",
  [ChartType.map]: "Map",
};

export enum ManageCustomViewAction {
  add = "add",
  delete = "delete",
  edit = "edit",
  clone = "clone",
}
