/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Sample data
// Needs to be changed to the actual data
const performanceData = {
  energy: { current: 135, average: 100 },
  emissions: { current: 125, average: 100 },
  water: { current: 140, average: 100 },
  waste: { current: 120, average: 100 },
}

const recommendations = [
  {
    category: "energy",
    title: "Upgrade Irrigation Pumps",
    description: "Replace old irrigation pumps with energy-efficient models.",
    impact: "Reduce energy usage by 20% and save $5,000 annually.",
    steps: [
      "Research energy-efficient irrigation pump models",
      "Get quotes from suppliers",
      "Schedule installation with a qualified technician",
    ],
    savings: 5000,
    implemented: false,
  },
  {
    category: "energy",
    title: "Install Solar Panels",
    description: "Implement a solar panel system to generate renewable energy.",
    impact: "Reduce carbon footprint by 30% and save $10,000 in the long term.",
    steps: [
      "Conduct a solar feasibility study",
      "Choose a reputable solar installer",
      "Apply for available solar incentives",
    ],
    savings: 10000,
    implemented: false,
  },
  {
    category: "emissions",
    title: "Optimize Machinery Usage",
    description: "Upgrade to electric or hybrid farm equipment.",
    impact: "Lower emissions by 25% and reduce fuel costs by $3,000 annually.",
    steps: [
      "Identify machinery for replacement",
      "Research electric/hybrid alternatives",
      "Create a phased replacement plan",
    ],
    savings: 3000,
    implemented: false,
  },
  {
    category: "water",
    title: "Implement Drip Irrigation",
    description: "Switch to a drip irrigation system for more efficient water use.",
    impact: "Reduce water usage by 30%, saving $2,500 annually on water bills.",
    steps: [
      "Design a drip irrigation layout",
      "Purchase necessary equipment",
      "Install the system or hire professionals",
    ],
    savings: 2500,
    implemented: false,
  },
  {
    category: "waste",
    title: "Expand Composting Program",
    description: "Increase composting efforts to reduce landfill waste.",
    impact: "Divert 25% more waste from landfills and improve soil health.",
    steps: [
      "Set up additional composting bins",
      "Train staff on proper composting techniques",
      "Implement a system to use compost in farm operations",
    ],
    savings: 2000,
    implemented: false,
  },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function SustainabilityRecommendations() {
  const [implementedRecommendations, setImplementedRecommendations] = useState<string[]>([])

  const toggleRecommendation = (title: string) => {
    setImplementedRecommendations(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  const totalSavings = recommendations
    .filter(rec => implementedRecommendations.includes(rec.title))
    .reduce((acc, rec) => acc + rec.savings, 0)

  const pieChartData = Object.entries(performanceData).map(([key, value]) => ({
    name: key,
    value: value.current,
  }))

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        
        <h1 className="text-3xl font-bold">AI-Curated Sustainability Recommendations</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Your performance compared to industry averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(performanceData).map(([key, value]) => ({ name: key, ...value }))}>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>AI-generated suggestions to improve your sustainability</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="energy">
            <TabsList>
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="emissions">Emissions</TabsTrigger>
              <TabsTrigger value="water">Water</TabsTrigger>
              <TabsTrigger value="waste">Waste</TabsTrigger>
            </TabsList>
            {["energy", "emissions", "water", "waste"].map((category) => (
              <TabsContent key={category} value={category}>
                {recommendations
                  .filter((rec) => rec.category === category)
                  .map((rec, index) => (
                    <Card key={index} className="mb-4">
                      <CardHeader>
                        <CardTitle>{rec.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">{rec.description}</p>
                        <p className="mb-4"><strong>Impact:</strong> {rec.impact}</p>
                        <h4 className="font-semibold mb-2">Steps to Implement:</h4>
                        <ol className="list-decimal pl-5 mb-4">
                          {rec.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                        <div className="flex justify-between items-center">
                          <span>Potential Savings: ${rec.savings.toLocaleString()}/year</span>
                          <Button
                            variant={implementedRecommendations.includes(rec.title) ? "secondary" : "default"}
                            onClick={() => toggleRecommendation(rec.title)}
                          >
                            {implementedRecommendations.includes(rec.title) ? "Implemented" : "Mark as Implemented"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      
    </div>
  )
}