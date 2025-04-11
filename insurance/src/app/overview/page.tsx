"use client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { MultiSelect } from "@/components/ui/multi-select";

const chartConfig = {
  name: {
    label: "name",
    color: "hsl(var(--chart-1))",
  },
  insurancePolicyId: {
    label: "insurancePolicyId",
    color: "hsl(var(--chart-2))",
  },
  sum: {
    label: "sum",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function Overview() {
  interface ChartData {
    insurancePolicyId: string;
    name: string;
    sum: number;
  }

  const [data, setData] = useState<{
    totalPolicyHolders: number;
    totalInsurancePolicies: number;
    totalAmount: number;
    chartData: ChartData[];
  }>({
    totalPolicyHolders: 0,
    totalInsurancePolicies: 0,
    totalAmount: 0,
    chartData: [],
  });

  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const filteredChartData = selectedNames.length > 0
    ? data.chartData.filter((item) => selectedNames.includes(item.name))
    : data.chartData;

  useEffect(() => {
    async function fetchData() {
      // Fetch data for cards and chart
      const response = await fetch("/api/overview-data");
      const result = await response.json();
      console.log(result);
      setData(result); // Ensure `result.chartData` has the correct structure
    }
    fetchData();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-4 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Total Policy Holders</CardTitle>
              <CardDescription>{data.totalPolicyHolders}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Insurance Policies</CardTitle>
              <CardDescription>{data.totalInsurancePolicies}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Amount of Money</CardTitle>
              <CardDescription>${data.totalAmount}</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="w-full mt-4">
          <MultiSelect
            options={data.chartData.toSorted((a,b)=> a.name.localeCompare(b.name)).map((item) => ({ label: item.name, value: item.name }))}
            value={selectedNames}
            onValueChange={(values) => setSelectedNames(values)}
            placeholder="Select names"
            className="w-full"
          />
        </div>
        <Card className="mt-8 w-full">
          <ChartContainer config={chartConfig} className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="insurancePolicyId" />
                <YAxis
                  allowDataOverflow={false}
                  domain={[0, Math.max(...filteredChartData.map((item) => item.sum)) + 100]}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent nameKey={"name"} label={"name"} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sum" fill="var(--primary)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>
    </DashboardShell>
  );
}
