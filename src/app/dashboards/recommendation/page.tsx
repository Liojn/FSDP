/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useMemo, useCallback, lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { recommendations, performanceData, COLORS } from "./data"
import ChartsSkeleton from "./components/ChartsSkeleton"
import Link from "next/link"
import RecommendationCard from "./components/RecommendationCard"

// Lazy load the Charts component
const Charts = lazy(async () => {
  return import('./components/Charts')
})


export default function SustainabilityRecommendations() {
  // State Management: Use Set for O(1) lookups
  const [implementedRecommendations, setImplementedRecommendations] = useState<Set<string>>(new Set())

  // Event handlers made stable with useCallback
  const toggleRecommendation = useCallback((title: string) => {
    setImplementedRecommendations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }, [])

  // Memoize expensive calculations
  const totalSavings = useMemo(() => {
    return recommendations
      .filter(rec => implementedRecommendations.has(rec.title))
      .reduce((acc, rec) => acc + rec.savings, 0)
  }, [implementedRecommendations])

  // Memoize filtered recommendations by category
  const recommendationsByCategory = useMemo(() => {
    const map: { [category: string]: typeof recommendations } = {}
    for (const rec of recommendations) {
      if (!map[rec.category]) map[rec.category] = []
      map[rec.category].push(rec)
    }
    return map
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">AI-Curated Sustainability Recommendations</h1>
      </div>

      {/* Code Splitting: Lazy load Charts component */}
      <Suspense fallback={<ChartsSkeleton />}>
        <Charts performanceData={performanceData} COLORS={COLORS} />
      </Suspense>

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
            {["energy", "emissions", "water", "waste"].map(category => (
              <TabsContent key={category} value={category}>
                {recommendationsByCategory[category]?.map(rec => (
                  <RecommendationCard
                    key={rec.title}
                    rec={rec}
                    isImplemented={implementedRecommendations.has(rec.title)}
                    toggleRecommendation={toggleRecommendation}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
