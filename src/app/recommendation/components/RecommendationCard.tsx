import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecommendationCardProps } from "@/types";

const RecommendationCard: React.FC<RecommendationCardProps> = memo(
  ({ rec, isImplemented, toggleRecommendation }) => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{rec.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                {rec.difficulty && (
                  <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
                    {rec.difficulty.charAt(0).toUpperCase() +
                      rec.difficulty.slice(1)}
                  </span>
                )}
                {rec.priority && (
                  <span className="text-sm px-2 py-1 rounded-full border">
                    Priority {rec.priority}
                  </span>
                )}
                {rec.roi && (
                  <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                    ROI: {rec.roi}%
                  </span>
                )}
              </div>
            </div>
            {rec.implementationTimeline && (
              <span className="text-sm text-gray-500">
                Est. Timeline: {rec.implementationTimeline}
              </span>
            )}
          </div>
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>
                Potential Savings: ${rec.savings.toLocaleString()}/year
              </span>
              <Button
                variant={isImplemented ? "secondary" : "default"}
                onClick={() => toggleRecommendation(rec.title)}
              >
                {isImplemented ? "Implemented" : "Mark as Implemented"}
              </Button>
            </div>
            {rec.sourceData && (
              <p className="text-sm text-gray-500">Source: {rec.sourceData}</p>
            )}
            {rec.dashboardLink && (
              <div className="text-sm">
                <a
                  href={rec.dashboardLink}
                  className="text-blue-600 hover:underline"
                >
                  View in Dashboard →
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";
export default RecommendationCard;
