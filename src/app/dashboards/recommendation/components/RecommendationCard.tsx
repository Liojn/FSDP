import React, { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecommendationCardProps {
  rec: {
    title: string
    description: string
    impact: string
    steps: string[]
    savings: number
  }
  isImplemented: boolean
  toggleRecommendation: (title: string) => void
}

const RecommendationCard: React.FC<RecommendationCardProps> = memo(({ rec, isImplemented, toggleRecommendation }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{rec.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">{rec.description}</p>
        <p className="mb-4">
          <strong>Impact:</strong> {rec.impact}
        </p>
        <h4 className="font-semibold mb-2">Steps to Implement:</h4>
        <ol className="list-decimal pl-5 mb-4">
          {rec.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
        <div className="flex justify-between items-center">
          <span>Potential Savings: ${rec.savings.toLocaleString()}/year</span>
          <Button
            variant={isImplemented ? "secondary" : "default"}
            onClick={() => toggleRecommendation(rec.title)}
          >
            {isImplemented ? "Implemented" : "Mark as Implemented"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

RecommendationCard.displayName = "RecommendationCard"
export default RecommendationCard
