
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineChartDisplayProps {
  data: Array<{ name: string; value: number }>;
  color?: string;
  height?: number;
}

export const LineChartDisplay = ({ 
  data, 
  color = "#8884d8", 
  height = 300 
}: LineChartDisplayProps) => {
  return (
    <div className={`h-[${height}px] w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke={color} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
