import { DropResult } from "react-beautiful-dnd";

import { DataBrowserFilterKey, WidgetGeneralVars, WidgetUnit } from "../hocs/withAddWidget";
import { ModelType, SystemType } from "./simulations";
import { DataBrowserFilters } from "./dataBrowserFilters";

export interface AddWidgetPrefilledProps {
  simulationId: number;
  sessionId: number;
  customViewId: number;
  targetRowIdx: number;
  targetColIdx: number;
  order: number;
  isEditMode?: boolean;
  isNewWidget?: boolean;
}

export interface AddWidgetPopupProps {
  isOpen: boolean;
  simulationId: number;
  sessionId: number;
  widgetUnits: WidgetUnit[];
  generalVars: WidgetGeneralVars;
  selectedUnitId: string;
  filters: DataBrowserFilters;
  systemsList: SystemType[];
  modelsList: ModelType[];
  instanceNumberList: number[];
  mapSystemModelsNamesList: { [system: string]: string[] };
  addNewWidgetUnit: (props?: Record<string, string>) => void;
  onGeneralVarChange: (key: string, value: string) => void;
  onWidgetUnitChange: (id: string, key: string, value: string) => void;
  onFiltersChange: (key: DataBrowserFilterKey, event: any) => void;
  selectParameter: (_event: any, nodeId: string, doublePath?: boolean) => void;
  selectWidgetUnit: (id: string) => void;
  onWidgetUnitsReorder: (result: DropResult) => void;
  onWidgetUnitEdit: (id: string) => void;
  onWidgetUnitDuplicate: (id: string) => void;
  onWidgetUnitDelete: (id: string) => void;
}
