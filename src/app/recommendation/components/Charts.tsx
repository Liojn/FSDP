import React, { memo, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"

interface ChartsProps {
  performanceData: Record<string, { current: number; average: number }>
  COLORS: string[]
}

const Charts: React.FC<ChartsProps> = memo(({ performanceData, COLORS }) => {
  // Memoize calculations
  const pieChartData = useMemo(
    () =>
      Object.entries(performanceData).map(([key, value]) => ({
        name: key,
        value: value.current,
      })),
    [performanceData]
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
        <CardDescription>Your performance compared to industry averages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(performanceData).map(([key, value]) => ({
                  name: key,
                  ...value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#8884d8" name="Your Performance" />
                <Bar dataKey="average" fill="#82ca9d" name="Industry Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
            <ul className="list-disc pl-5">
              <li>Energy consumption is 35% higher than average</li>
              <li>Carbon emissions are 25% above industry standard</li>
              <li>Water usage is 40% higher than recommended</li>
              <li>Waste recycling is 20% below similar farms</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Impact</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

Charts.displayName = "Charts"
export default Charts
