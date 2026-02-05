import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { DropResult } from "react-beautiful-dnd";

import { AddWidgetPopupProps, AddWidgetPrefilledProps } from "../types/addWidgetPopupProps";
import AddWidgetPopupLayout from "../layouts/AddWidgetPopupLayout";
import { getPopupPrefilledInfo } from "../redux/reducers/popupsReducer";
import { StoreType } from "../redux/types/store.types";
import { getCurrentCustomView } from "../redux/reducers/customViewReducer";
import { getSimulationHyrarchy } from "../redux/reducers/simulationReducer";
import { Model, ModelDataItem, System } from "../types/simulations";
import {
  ChartRangeType,
  CustomViewType,
  CustomViewTableCell,
  DisplayElement,
  DisplayElementSimulationControl,
  DisplayElementStaticText,
  DisplayElementType,
  InternalLayoutType,
  ModelParameter,
  XyChartDataSet,
} from "../types/customViews";
import {
  getCustomViewDataServer,
  updateCustomViewData,
  updateCustomViewLayoutServer,
} from "../redux/actions/customViewActions";
import { generateNewWidgetTemplate, retrieveSystemModelFromPath } from "../lib/addWidgetUtils";
import { updatePopup } from "../redux/actions/popupsActions";
import { Popups } from "../types/popups";
import { DataBrowserFilters } from "../types/dataBrowserFilters";
import { getCurrentScenarioFiles } from "../redux/reducers/scenarioFilesReducer";

export type WidgetUnit = { id: string } & Record<string, string>;

export type WidgetGeneralVars = Record<string, string>;

const initialFilters = {
  caption: "",
  search: "",
  systemType: [],
  modelType: [],
  instanceNumber: "0",
};

interface AdditionalProps {
  title: string;
  elementType: DisplayElementType;
  popup: Popups;
  stateGetterFunc: (state: StoreType) => boolean;
}

export interface FilterOption {
  placeholder: string;
  options: string[];
}

export type DataBrowserFilterKey = "caption" | "search" | "systemType" | "modelType" | "instanceNumber" | string;

export const generateWidgetUnitId = () => Math.random().toString(16).slice(2);

const withAddWidget = (
  Component: (props: AddWidgetPopupProps) => JSX.Element,
  { title, elementType, popup, stateGetterFunc }: AdditionalProps,
): (() => JSX.Element) => {
  const AddWidget = () => {
    const dispatch = useDispatch();

    const isOpen = useSelector(stateGetterFunc);
    const prefilled = useSelector(getPopupPrefilledInfo);
    const customView = useSelector(getCurrentCustomView);
    const simulationHierarchy = useSelector(getSimulationHyrarchy);
    const scenarioFiles = useSelector(getCurrentScenarioFiles);
    const isDataFetched = useRef<boolean>(false);
    const isDataPrefilled = useRef<boolean>(false);

    const systems = (simulationHierarchy?.["simulation-systems"] || []) as System[];

    const systemsList = simulationHierarchy?.["system-types"] || [];
    const modelsList = simulationHierarchy?.["model-types"] || [];
    const instanceNumberList = Array.from(Array(Number(simulationHierarchy?.["total-number-of-systems"]) || 0).keys());

    const mapSystemModelsNamesList: { [system: string]: string[] } = systemsList.reduce(
      (acc, curr) => ({
        ...acc,
        [curr["system-type-name"]]: modelsList
          .filter((model) => model["model-type-name"].split("/")[0] === curr["system-type-name"])
          .map((model) => model["model-type-name"]),
      }),
      {},
    );

    const allParameters = useMemo(
      () => [
        ...(simulationHierarchy?.["custom-simulation-data"] || []),
        ...systems
          .reduce((acc, curr) => [...acc, ...(curr["system-models"] || [])], [] as Model[])
          .reduce((acc, curr) => [...acc, ...(curr["model-data-items"] || [])], [] as ModelDataItem[]),
      ],
      [systems],
    );

    const [widgetUnits, setWidgetUnits] = useState<WidgetUnit[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<string>("");
    const [generalVars, setGeneralVars] = useState<WidgetGeneralVars>({});
    const [filters, setFilters] = useState<DataBrowserFilters>(initialFilters);

    const { simulationId, sessionId, customViewId, targetRowIdx, targetColIdx, order, isEditMode, isNewWidget } =
      (prefilled as AddWidgetPrefilledProps) || {};

    const targetWidget: DisplayElement | null = useMemo(
      () =>
        customView && prefilled && !isNewWidget
          ? (
              customView["view-table-cells"].find(
                (cell) =>
                  cell["custom-view-cell-row-index"] === targetRowIdx &&
                  cell["custom-view-cell-column-index"] === targetColIdx,
              ) as CustomViewTableCell
            )?.["display-section-elements"]?.[order]
          : null,
      [customView, prefilled],
    );

    const clearPopupState = () => {
      setWidgetUnits([]);
      setSelectedUnitId("");
      setGeneralVars({});
      setFilters(initialFilters);

      isDataPrefilled.current = false;
      isDataFetched.current = false;
    };

    useEffect(() => {
      if (!isDataPrefilled.current && isEditMode && targetWidget && isOpen) {
        let generalVars: WidgetGeneralVars = { "display-element-caption": targetWidget["display-element-caption"] };

        switch (targetWidget["display-element-type"]) {
          case DisplayElementType.table:
            setWidgetUnits(
              targetWidget["table-data"][0]["model-parameters"].map((el) => ({
                ...Object.entries(el).reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {}),
                id: generateWidgetUnitId(),
              })),
            );
            break;

          case DisplayElementType.gauges:
            setWidgetUnits(
              targetWidget["gauges-data"].map((gauge) => ({
                ...Object.entries(gauge["model-parameter-data"][0]).reduce(
                  (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
                  {},
                ),
                "gauge-maximum-value": String(gauge["gauge-maximum-value"]),
                id: generateWidgetUnitId(),
              })),
            );
            break;

          case DisplayElementType.chart:
            setWidgetUnits(
              targetWidget["chart-data"][0]["chart-data"].map((item) => ({
                "data-set-color": item["data-set-color"],
                "parameter-name": item["y-data-set-name"],
                "parameter-path": item["y-parameter-path"],
                "parameter-value": String(item["y-values"][0]),
                "system-model": (item as XyChartDataSet & Record<string, string>)["system-model"],
                "parameter-data-set": (item as XyChartDataSet & Record<string, string>)["parameter-data-set"],
                "parameter-scale": (item as XyChartDataSet & Record<string, string>)["parameter-scale"],
                "parameter-units": (item as XyChartDataSet & Record<string, string>)["parameter-units"],
                id: generateWidgetUnitId(),
              })),
            );
            generalVars = {
              ...generalVars,
              "chart-x-axis-label": targetWidget["chart-data"][0]["chart-x-axis-label"],
              "chart-y-axis-label": targetWidget["chart-data"][0]["chart-y-axis-label"],
              "chart-x-axis-range-type": String(
                targetWidget["chart-data"][0]["chart-x-axis-range-type"] === ChartRangeType.manual,
              ),
              "chart-y-axis-range-type": String(
                targetWidget["chart-data"][0]["chart-y-axis-range-type"] === ChartRangeType.manual,
              ),
              "chart-min-x-axis-value": String(targetWidget["chart-data"][0]["chart-min-x-axis-value"]),
              "chart-max-x-axis-value": String(targetWidget["chart-data"][0]["chart-max-x-axis-value"]),
              "chart-min-y-axis-value": String(targetWidget["chart-data"][0]["chart-min-y-axis-value"]),
              "chart-max-y-axis-value": String(targetWidget["chart-data"][0]["chart-max-y-axis-value"]),
              "chart-type": targetWidget["chart-data"][0]["chart-type"],
              "chart-aspect-ratio": String(targetWidget["chart-data"][0]["chart-aspect-ratio"]),
              "chart-history-size": String(targetWidget["chart-data"][0]["chart-history-size"]),
              "chart-step-interval": String(targetWidget["chart-data"][0]["chart-step-interval"]),
            };
            break;

          case DisplayElementType.map:
            setWidgetUnits(
              targetWidget["map-data"][0]["latitude-data-points-degrees"].map((item, idx) => ({
                name: item["parameter-name"],
                units: item["parameter-units"],
                "latitude-parameter-value": String(item["parameter-value"]),
                "longitude-parameter-value": String(
                  targetWidget["map-data"][0]["longitude-data-points-degrees"][idx]["parameter-value"],
                ),
                "latitude-parameter-path": item["parameter-path"],
                "longitude-parameter-path":
                  targetWidget["map-data"][0]["longitude-data-points-degrees"][idx]["parameter-path"],
                "system-model": (item as ModelParameter & Record<string, string>)["system-model"],
                id: generateWidgetUnitId(),
              })),
            );

            generalVars = {
              ...generalVars,
              "initial-zoom-level": String(targetWidget["map-data"][0]["initial-zoom-level"]),
              "chart-source": targetWidget["map-data"][0]["chart-source"],
              "icon-type": targetWidget["map-data"][0]["icon-type"],
              "is-auto-map-center": String(targetWidget["map-data"][0]["is-auto-map-center"]),
              "central-latitude": String(targetWidget["map-data"][0]["central-latitude"]),
              "central-longitude": String(targetWidget["map-data"][0]["central-longitude"]),
            };
            break;

          case DisplayElementType.buttons:
            setWidgetUnits(
              targetWidget["buttons-data"].map((item) => ({
                "button-id": String(item["button-id"]),
                "button-icon": item["button-icon"],
                "button-caption": item["button-caption"],
                "button-type": item["button-type"],
                "button-color": item["button-color"],
                "action-key": item["action-key"],
                "scenario-file-name":
                  scenarioFiles.find((file) => file["scenario-file-id"] === item["scenario-file-id"])?.[
                    "scenario-file-name"
                  ] || "",
                //"scenario-file-id": String(item["scenario-file-id"]),
                id: generateWidgetUnitId(),
              })),
            );
            break;
        }

        setGeneralVars(generalVars);

        isDataPrefilled.current = true;
      }
    }, [targetWidget, isEditMode, isOpen]);

    useEffect(() => {
      return () => {
        clearPopupState();
      };
    }, []);

    useEffect(() => {
      if (!isDataFetched.current && sessionId && customViewId) {
        dispatch(getCustomViewDataServer({ "simulation-session-id": +sessionId, "custom-view-id": +customViewId }));
        isDataFetched.current = true;
      }
    }, [sessionId, customViewId]);

    const handleConfirm = () => {
      if (
        !widgetUnits.length ||
        widgetUnits.some(
          (unit) =>
            !unit["parameter-path"] &&
            (!unit["latitude-parameter-path"] || !unit["longitude-parameter-path"]) &&
            !unit["action-key"] &&
            !unit["scenario-file-name"],
        )
      ) {
        toast.error("Validation failed, please fill in all the required fields!");
        return;
      }

      const currentCell = customView?.["view-table-cells"].find(
        (el) =>
          el["custom-view-cell-row-index"] == targetRowIdx && el["custom-view-cell-column-index"] === targetColIdx,
      ) as CustomViewTableCell;

      const currentWidget = currentCell?.["display-section-elements"].find(
        (el) => el["display-order-within-layout-section"] === order,
      ) as DisplayElement;

      const lastId: number = (customView?.["view-table-cells"] || [])
        .reduce((acc, curr) => [...acc, ...curr["display-section-elements"]], [] as DisplayElement[])
        .reduce((acc, curr) => (curr["display-element-id"] > acc ? curr["display-element-id"] : acc), 0);

      const initialDisplayElement: DisplayElement =
        isEditMode && targetWidget
          ? targetWidget
          : {
              "display-element-id": lastId + 1,
              "display-element-caption": generalVars["display-element-caption"] || `new ${elementType}`,
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
        "display-element-caption": generalVars["display-element-caption"],
        ...generateNewWidgetTemplate(elementType, widgetUnits, generalVars, {
          "system-types": systemsList,
          "model-types": modelsList,
          "scenario-files": scenarioFiles,
        }),
      };

      let nextWidgetsList: DisplayElement[] = currentCell?.["display-section-elements"] || [];

      if (!isEditMode) {
        const updatedWidgetsList: DisplayElement[] = (currentCell?.["display-section-elements"] || []).map((el) =>
          el["display-order-within-layout-section"] >= order
            ? { ...el, "display-order-within-layout-section": el["display-order-within-layout-section"] + 1 }
            : el,
        );

        nextWidgetsList = [...updatedWidgetsList, newDisplayElement].sort(
          (a, b) => a["display-order-within-layout-section"] - b["display-order-within-layout-section"],
        );
      } else if (targetWidget) {
        nextWidgetsList = (currentCell?.["display-section-elements"] || []).map((el) =>
          el["display-element-id"] === targetWidget["display-element-id"] ? newDisplayElement : el,
        );
      }

      const nextCell: CustomViewTableCell = { ...currentCell, "display-section-elements": nextWidgetsList };

      const nextCellsList: CustomViewTableCell[] = (customView?.["view-table-cells"] || []).map((el) =>
        el["custom-view-cell-row-index"] == targetRowIdx && el["custom-view-cell-column-index"] === targetColIdx
          ? nextCell
          : el,
      );

      const nextCustomView = { ...(customView as CustomViewType), "view-table-cells": nextCellsList };

      dispatch(updateCustomViewData(nextCustomView));

      dispatch(
        updateCustomViewLayoutServer({
          "simulation-id": simulationId,
          "custom-view-id": customViewId,
          nextData: nextCustomView,
        }),
      );

      handleClose();
    };

    const handleClose = () => {
      dispatch(
        updatePopup({
          popup,
          status: false,
          prefilled: {
            simulationId: null,
            sessionId: null,
            customViewId: null,
            targetRowIdx: null,
            targetColIdx: null,
            order: null,
            isNewWidget: false,
            isEditMode: false,
          },
        }),
      );
      clearPopupState();
    };

    const selectWidgetUnit = (id: string) => {
      const targetUnit = widgetUnits.find((unit) => unit.id === id) as WidgetUnit;

      if (
        targetUnit &&
        (targetUnit["parameter-path"] ||
          (targetUnit["latitude-parameter-path"] && targetUnit["longitude-parameter-path"]))
      )
        return;
      if (id !== selectedUnitId) setSelectedUnitId(id);
    };

    const addNewWidgetUnit = (props: Record<string, string> = {}) => {
      setWidgetUnits((prev) => [...prev, { ...props, id: generateWidgetUnitId() }]);
    };

    const selectParameter = (_event: any, nodeId: string, doublePath = false) => {
      const targetParam = allParameters.find((param) => param["param-path"] === nodeId);
      const allChilds = allParameters.filter((param) => param["param-path"].includes(nodeId));

      if (!targetParam) return;
      if (allChilds.length > 1) return;

      if (targetParam) {
        const nextWidgetUnits: WidgetUnit[] = widgetUnits.map((unit, idx) =>
          unit.id === selectedUnitId
            ? ({
                ...unit,
                "system-model": retrieveSystemModelFromPath(targetParam["param-path"]),
                "parameter-order": String(idx),
                "parameter-name": targetParam["param-data-name"],
                "parameter-units": targetParam["param-data-units"] || "",
                "parameter-value": "",
                ...(!doublePath
                  ? { "parameter-path": targetParam["param-path"] }
                  : {
                      "latitude-parameter-path": unit["latitude-parameter-path"] || targetParam["param-path"],
                      "longitude-parameter-path": unit["latitude-parameter-path"]
                        ? unit["longitude-parameter-path"] || targetParam["param-path"]
                        : "",
                    }),
              } as WidgetUnit)
            : unit,
        );
        setWidgetUnits(nextWidgetUnits);
        setSelectedUnitId("");

        toast.info("Selected the paramater");
      }
    };

    const onFiltersChange = (key: DataBrowserFilterKey, event: any) => {
      let newValue;
      const textFields = ["caption", "search"];

      if (textFields.includes(key)) newValue = event.target.value;
      else newValue = event;

      setFilters({ ...filters, [key]: newValue });
    };

    const onGeneralVarChange = (key: string, value: string) => {
      setGeneralVars((prev) => ({ ...prev, [key]: value }));
    };

    const onWidgetUnitChange = (id: string, key: string, value: string, valueType?: "string" | "number") => {
      if (valueType !== "number" || /^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
        setWidgetUnits((prev) => prev.map((unit) => (unit.id === id ? { ...unit, [key]: value } : unit)));
      }
    };

    const onWidgetUnitsReorder = (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const reorderedRows = Array.from(widgetUnits);
      const [removed] = reorderedRows.splice(result.source.index, 1);
      reorderedRows.splice(result.destination.index, 0, removed);

      setWidgetUnits(reorderedRows);
    };

    const onWidgetUnitEdit = (id: string) => {
      setSelectedUnitId(id);
    };

    const onWidgetUnitDuplicate = (id: string) => {
      const duplicatedRow = {
        ...(widgetUnits.find((unit) => unit.id === id) as WidgetUnit),
        id: generateWidgetUnitId(),
      };

      const nextData = [...widgetUnits];
      nextData.splice(widgetUnits.findIndex((unit) => unit.id === id) + 1, 0, duplicatedRow);

      setWidgetUnits(nextData);
    };

    const onWidgetUnitDelete = (id: string) => {
      setWidgetUnits((prev) => prev.filter((unit) => unit.id !== id));

      if (id === selectedUnitId) setSelectedUnitId("");
    };

    const popupProps: AddWidgetPopupProps = {
      isOpen,
      simulationId,
      sessionId,
      widgetUnits,
      generalVars,
      selectedUnitId,
      filters,
      systemsList,
      modelsList,
      instanceNumberList,
      mapSystemModelsNamesList,
      addNewWidgetUnit,
      onGeneralVarChange,
      onWidgetUnitChange,
      onFiltersChange,
      selectParameter,
      selectWidgetUnit,
      onWidgetUnitsReorder,
      onWidgetUnitEdit,
      onWidgetUnitDuplicate,
      onWidgetUnitDelete,
    };

    return (
      <AddWidgetPopupLayout title={title} isOpen={isOpen} onConfirm={handleConfirm} onDecline={handleClose}>
        <Component {...popupProps} />
      </AddWidgetPopupLayout>
    );
  };

  return AddWidget;
};

export default withAddWidget;
