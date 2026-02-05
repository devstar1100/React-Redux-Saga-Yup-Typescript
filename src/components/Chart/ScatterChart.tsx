import { styled } from "@mui/material";
import { CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, ScatterChart, Scatter } from "recharts";
import { AxisDomain } from "recharts/types/util/types";

export interface SimpleChart {
  name: string;
  uv: number;
}

interface AreaChartProps {
  data: SimpleChart[] | any;
  aspectRatio?: number;
  xAxisDomain?: AxisDomain;
  yAxisDomain?: AxisDomain;
  labels?: { x: string; y: string };
}

const AreaChart = ({
  data,
  aspectRatio = 2,
  xAxisDomain = ["auto", "auto"],
  yAxisDomain = [0, "auto"],
  labels,
}: AreaChartProps) => (
  <ResponsiveContainer width={"100%"} aspect={aspectRatio}>
    <RechartsAreaChart data={data.graphData} margin={{ top: 0, right: 0, left: 15, bottom: 30 }}>
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#fff" stopOpacity={0.1} />
          <stop offset="95%" stopColor="#000" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <Legend
        verticalAlign="top"
        align="right"
        iconType="circle"
        wrapperStyle={{
          padding: "20px",
          fontSize: "13px",
          fontWeight: 400,
        }}
      />
      <XAxis
        type="number"
        domain={xAxisDomain}
        dataKey="name"
        axisLine={false}
        tickLine={false}
        dy={15}
        label={{ value: labels?.x, position: "insideBottom", offset: -27 }}
      />
      <YAxis
        type="number"
        domain={yAxisDomain}
        axisLine={false}
        tickLine={false}
        dx={-15}
        label={{ value: labels?.y, angle: -90, position: "insideLeft", offset: -10 }}
      />
      <CartesianGrid stroke="#1F1F22" vertical={false} />
      {data.areas.map((area: any) => (
        <Scatter
          key={area.key}
          dataKey={area.key}
          stroke={area.stroke}
          fillOpacity={1}
          fill={area.stroke}
          strokeWidth={2}
          shape={"circle"}
          line
        />
      ))}
    </RechartsAreaChart>
  </ResponsiveContainer>
);

export const RechartsAreaChart = styled(ScatterChart)(({ theme }) => ({
  ".recharts-text": {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.body2.fontWeight,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fill: theme.palette.textColor.main,
  },

  ".recharts-legend-item": {
    margin: "0 0 0 32px !important",
    display: "inline-flex !important",
    alignItems: "center !important",

    ".recharts-legend-item-text": {
      color: `${theme.palette.textColor.main} !important`,
      fontFamily: theme.typography.fontFamily,
    },
  },
}));

export default AreaChart;
