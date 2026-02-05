import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

export interface PieChart {
  name: string;
  value: number;
}

export interface PieColor {
  background: string;
  filledFrom: string;
  filledTo: string;
}

interface PieChartProps {
  data: PieChart;
  colors: PieColor;
  startDegree: number;
  index: number;
}

const PieChart = ({ data, colors, startDegree, index }: PieChartProps) => (
  <RadialBarChart
    style={{ transform: `rotate(${startDegree - 90}deg)` }}
    width={118}
    height={118}
    innerRadius="60%"
    outerRadius="80%"
    data={[data]}
    startAngle={360}
    endAngle={0}
  >
    <defs>
      <linearGradient id={"gradient" + index} x1="0%" y1="0%" x2="0%" y2={`100%`}>
        <stop offset="5%" stopColor={colors.filledTo} stopOpacity="1" />
        <stop offset="95%" stopColor={colors.filledFrom} stopOpacity="1" />
      </linearGradient>
    </defs>
    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
    <RadialBar
      background={{ fill: colors.background }}
      dataKey="value"
      fill={`url(#${"gradient" + index})`}
      cornerRadius={20}
    />
  </RadialBarChart>
);

export default PieChart;
