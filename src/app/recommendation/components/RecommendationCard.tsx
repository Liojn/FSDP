import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // import Tooltip components
import { RecommendationCardProps } from "@/types";

const RecommendationCard: React.FC<RecommendationCardProps> = memo(
  ({ rec }) => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{rec.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                {rec.difficulty && (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
                        {rec.difficulty}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Difficulty Level: {rec.difficulty}</span>
                    </TooltipContent>
                  </Tooltip>
                )}
                {rec.priorityLevel && (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-sm px-2 py-1 rounded-full border">
                        {rec.priorityLevel}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Priority Level: {rec.priorityLevel}</span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {rec.estimatedTimeframe && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-sm text-gray-500">
                    Est. Timeline: {rec.estimatedTimeframe}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Estimated Timeframe to Implement</span>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-2">{rec.description}</p>
          <p className="mb-4">
            <strong>Impact:</strong> {rec.impact}
          </p>
          {rec.implementationSteps && rec.implementationSteps.length > 0 && (
            <>
              <h4 className="font-semibold mb-2">Steps to Implement:</h4>
              <ol className="list-decimal pl-5 mb-4">
                {rec.implementationSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>
                Estimated Emission Reduction:{" "}
                {rec.estimatedEmissionReduction.toLocaleString()} CO₂e
                {rec.estimatedCost > 0
                  ? ` | Cost: $${rec.estimatedCost.toLocaleString()}`
                  : ""}
              </span>
            </div>
            {rec.relatedMetrics && rec.relatedMetrics.length > 0 && (
              <p className="text-sm text-gray-500">
                Related Metrics: {rec.relatedMetrics.join(", ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.rec.id === nextProps.rec.id &&
      prevProps.isImplemented === nextProps.isImplemented &&
      prevProps.rec.estimatedEmissionReduction ===
        nextProps.rec.estimatedEmissionReduction
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";
export default RecommendationCard;
