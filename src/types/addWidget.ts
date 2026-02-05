import { ReactElement } from "react";

import { DisplayElementButtonType, MapIconType } from "./customViews";

export interface WidgetParameter {
  variant: "select" | "input" | "checkbox";
  placeholder?: string;
  width?: number;
  title?: string;
  categoryName?: string;
  options?: string[];
  type?: "text" | "number";
}

export interface ButtonUnit {
  "button-caption": string;
  // "button-type": DisplayElementButtonType;
  "action-key": string;
  "button-icon": MapIconType;
  "scenario-file-name": string;
}

export type WidgetsList = {
  icon: ReactElement;
  title: string;
  getHandlerFunc: (rowIdx: number, colIdx: number, order: number) => () => void;
}[];
