import { FC, useMemo } from "react";

import Container, { DisplayElementId } from "../WidgetContainer/WidgetContainer";
import AreaChart from "../Chart/ScatterChart";
import { DisplayElementXYChart, DataSetColor, ChartRangeType } from "../../types/customViews";

interface Props {
  chartData: DisplayElementXYChart[];
  title: string;
}

interface Area {
  key: string;
  stroke: string;
}

const lineColors: Record<DataSetColor, string> = {
  "blue-300": "#006BF6",
  "green-300": "#4DD78F",
  "red-400": "#D73232",
  "yellow-400": "#E3AB1F",
  "violet-400": "#683FD3",
  "lite-blue-300": "#3DBBDE",
  "grey-100": "#B7B7B7",
  "grey-200": "#636363",
  white: "#ffffff",
};

const Altitude: FC<Props & DisplayElementId> = ({ chartData, title, elementId }) => {
  const [formatedChartData, formatedAreas] = useMemo(() => {
    const areas: Area[] = [];

    const formatedChartData = chartData[0]["chart-data"]
      ?.filter((el) => (el as any)["parameter-data-set"] === "Y-axis")
      .reduce((acc: Record<string, string>[], chart) => {
        const resultAcc: Record<string, string>[] = [];

        (chart["x-values"] || []).forEach((value, axisIndex) => {
          const elementsForIndex: Record<string, string> = acc[axisIndex] || {};

          elementsForIndex.name = value?.toString();
          elementsForIndex[chart["y-data-set-name"]] = chart["y-values"][axisIndex].toString();

          resultAcc.push(elementsForIndex);
        });

        areas.push({ key: chart["y-data-set-name"], stroke: lineColors[chart["data-set-color"]] });
        return resultAcc;
      }, []);

    return [formatedChartData, areas];
  }, [chartData]);

  const areaChartData = {
    areas: formatedAreas,
    graphData: formatedChartData.map((obj) =>
      Object.entries(obj).reduce((prev, [key, value]) => ({ ...prev, [key]: Number(value) }), {}),
    ),
  };

  const xAxisDomain =
    chartData[0]["chart-x-axis-range-type"] === ChartRangeType.manual
      ? [chartData[0]["chart-min-x-axis-value"], chartData[0]["chart-max-x-axis-value"]]
      : ["auto", "auto"];

  const yAxisDomain =
    chartData[0]["chart-y-axis-range-type"] === ChartRangeType.manual
      ? [chartData[0]["chart-min-y-axis-value"], chartData[0]["chart-max-y-axis-value"]]
      : ["0", "auto"];

  return (
    <Container title={title} elementId={elementId}>
      <AreaChart
        data={areaChartData}
        aspectRatio={chartData[0]["chart-aspect-ratio"]}
        xAxisDomain={xAxisDomain}
        yAxisDomain={yAxisDomain}
        labels={{ x: chartData[0]["chart-x-axis-label"], y: chartData[0]["chart-y-axis-label"] }}
      />
    </Container>
  );
};

export default Altitude;
