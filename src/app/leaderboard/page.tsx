/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"

// Sample leaderboard data
const leaderboardData = [
  { name: "John Doe", score: 1200 },
  { name: "Jane Smith", score: 1100 },
  { name: "Mike Johnson", score: 1050 },
  { name: "Emily Davis", score: 980 },
]

export default function Leaderboard() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      

      <div className="flex justify-end">
        <Button className="bg-gray-800 text-white">Back to Dashboard</Button>
      </div>
    </div>
  )
}
