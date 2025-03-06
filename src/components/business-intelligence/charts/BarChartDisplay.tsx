
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface BarChartDisplayProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  singleColor?: string;
}

export const BarChartDisplay = ({ 
  data, 
  colors, 
  height = 400,
  singleColor 
}: BarChartDisplayProps) => {
  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill={singleColor || "#8884d8"}>
            {!singleColor && colors && data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
