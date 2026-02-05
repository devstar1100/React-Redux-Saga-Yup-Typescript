import {
  CustomViewType,
  CustomViewDetailedRefreshData,
  CustomViewTableCell,
  DisplayElement,
  DisplayElementButton,
  DisplayElementGauge,
  DisplayElementMap,
  DisplayElementParameters,
  DisplayElementTable,
  DisplayElementXYChart,
  ModelParameter,
} from "../types/customViews";

export const updateCustomViewParamsValues = (
  refreshedData: CustomViewDetailedRefreshData,
  prevData: CustomViewType,
): CustomViewType => {
  const nextCells: CustomViewTableCell[] = prevData["view-table-cells"].map((cell) => {
    const nextElements: DisplayElement[] = cell["display-section-elements"].map((element) => {
      const nextButtonsData: DisplayElementButton[] = (element["buttons-data"] || []).map((button) => {
        const updatedData = refreshedData["display-element-button-statuses"].find(
          (item) =>
            item["display-element-id"] === element["display-element-id"] && item["button-id"] === button["button-id"],
        );

        if (updatedData)
          return {
            ...button,
            "button-caption": updatedData["button-caption"],
            "button-status": updatedData["button-status"],
          };

        return button;
      });

      const nextGaugesData: DisplayElementGauge[] = updateParamsValues(
        element["gauges-data"] || [],
        refreshedData,
        element,
      ) as DisplayElementGauge[];

      const nextParametersData: DisplayElementParameters[] = updateParamsValues(
        element["parameters-data"] || [],
        refreshedData,
        element,
      ) as DisplayElementParameters[];

      const nextTableData: DisplayElementTable[] = updateParamsValues(
        element["table-data"] || [],
        refreshedData,
        element,
      ) as DisplayElementTable[];

      const nextMapData: DisplayElementMap[] = (element["map-data"] || []).map((map) => {
        const updatedLatDataPoints = (map["latitude-data-points-degrees"] || []).map((param) =>
          updateParam(param, refreshedData, element),
        );
        const updatedLngDataPoints = (map["longitude-data-points-degrees"] || []).map((param) =>
          updateParam(param, refreshedData, element),
        );

        return {
          ...map,
          "latitude-data-points-degrees": updatedLatDataPoints,
          "longitude-data-points-degrees": updatedLngDataPoints,
        };
      });

      const nextChartData: DisplayElementXYChart[] = (element["chart-data"] || []).map((chart) => {
        const nextChartData = chart["chart-data"].map((dataSet) => {
          const updatedData = refreshedData["display-element-data-item-array-values"].find(
            (item) =>
              item["display-element-id"] === element["display-element-id"] &&
              item["y-data-set-path"] === dataSet["y-parameter-path"] &&
              item["x-data-set-path"] == dataSet["x-data-set-path"],
          );

          if (updatedData)
            return { ...dataSet, "x-values": updatedData["x-values"], "y-values": updatedData["y-values"] };

          return dataSet;
        });

        return { ...chart, "chart-data": nextChartData };
      });

      return {
        ...element,
        "buttons-data": nextButtonsData,
        "gauges-data": nextGaugesData,
        "parameters-data": nextParametersData,
        "table-data": nextTableData,
        "chart-data": nextChartData,
        "map-data": nextMapData,
      };
    });

    return { ...cell, "display-section-elements": nextElements };
  });

  return { ...prevData, "view-table-cells": nextCells };
};

const updateParamsValues = (
  data: DisplayElementGauge[] | DisplayElementParameters[] | DisplayElementTable[],
  refreshedData: CustomViewDetailedRefreshData,
  element: DisplayElement,
) =>
  data.map((dataEntry) => {
    const fieldName = (dataEntry as DisplayElementGauge | DisplayElementParameters)["model-parameter-data"]
      ? "model-parameter-data"
      : (dataEntry as DisplayElementTable)["model-parameters"]
      ? "model-parameters"
      : "";

    if (fieldName) {
      const nextParamValues = (dataEntry[fieldName as keyof typeof dataEntry] as ModelParameter[]).map((param) =>
        updateParam(param, refreshedData, element),
      );

      return { ...dataEntry, [fieldName]: nextParamValues };
    }

    return dataEntry;
  });

const updateParam = (param: ModelParameter, refreshedData: CustomViewDetailedRefreshData, element: DisplayElement) => {
  const updatedData = refreshedData["display-element-data-item-values"].find(
    (item) =>
      item["display-element-id"] === element["display-element-id"] &&
      item["parameter-path"] === param["parameter-path"],
  );

  if (updatedData) {
    const newParamValueNumeric = +updatedData["parameter-value"];
    const newParamValue = Number.isNaN(newParamValueNumeric) ? updatedData["parameter-value"] : newParamValueNumeric;
    return { ...param, "parameter-value": newParamValue } as ModelParameter;
  }

  return param;
};
