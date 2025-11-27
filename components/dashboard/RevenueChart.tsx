"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface RevenueChartProps {
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
  title: string;
  type?: "line" | "area" | "bar";
  dataKeys?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
}

export function RevenueChart({
  data,
  title,
  type = "area",
  dataKeys = [
    { key: "total", name: "Total Revenue", color: "#3b82f6" },
    { key: "affiliate", name: "Affiliate", color: "#10b981" },
    { key: "subscription", name: "Subscription", color: "#8b5cf6" },
    { key: "advertising", name: "Advertising", color: "#f59e0b" },
  ],
}: RevenueChartProps) {
  const ChartComponent =
    type === "line" ? LineChart : type === "bar" ? BarChart : AreaChart;

  const DataComponent =
    type === "line" ? Line : type === "bar" ? Bar : Area;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {dataKeys.map((item) => (
            <DataComponent
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              fill={item.color}
              fillOpacity={type === "area" ? 0.6 : 1}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </Card>
  );
}
