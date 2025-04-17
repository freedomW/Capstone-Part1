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
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";

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
  // Use the useSession hook to access session data including user role
  const { data: session, status } = useSession();
  
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  const filteredChartData = selectedNames.length > 0
    ? data.chartData.filter((item) => selectedNames.includes(item.name))
    : data.chartData;

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch data for cards and chart
        const response = await fetch("/api/overview-data");
        const result = await response.json();
        setData(result); // Ensure `result.chartData` has the correct structure
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-4 w-full">
          {isLoading ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Total Policy Holders</CardTitle>
                  <CardDescription><Skeleton className="h-6 w-16" /></CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Insurance Policies</CardTitle>
                  <CardDescription><Skeleton className="h-6 w-16" /></CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Amount of Money</CardTitle>
                  <CardDescription><Skeleton className="h-6 w-24" /></CardDescription>
                </CardHeader>
              </Card>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        <Card className="mt-8 w-full">
          <CardHeader>
            <CardTitle>Amount Sum of Insurance Policies</CardTitle>
          </CardHeader>
          
        <div className="w-full px-4">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <MultiSelect
              options={data.chartData.toSorted((a,b)=> a.name.localeCompare(b.name)).map((item) => ({ label: item.name, value: item.name }))}
              value={selectedNames}
              onValueChange={(values) => setSelectedNames(values)}
              placeholder="Select names"
              className="w-full"
            />
          )}
        </div>
          {isLoading ? (
            <div className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer>
                <BarChart data={filteredChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="insurancePolicyId" />
                  <YAxis
                    allowDataOverflow={false}
                    domain={[0, Math.max(...filteredChartData.map((item) => item.sum)) + 100]}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip 
                    content={props => {
                      if (!props.active || !props.payload?.length) {
                        return null;
                      }
                      
                      const data = props.payload[0].payload;
                      return (
                        <div className="border-border/50 bg-background grid min-w-[8rem] rounded-lg border px-3 py-2 shadow-xl">
                          <div className="font-medium">{data.name}</div>
                          <div className="text-xs text-muted-foreground">Policy ID: {data.insurancePolicyId}</div>
                          <div className="text-sm font-medium mt-1">Amount: ${data.sum}</div>
                        </div>
                      );
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="sum" fill="var(--primary)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
