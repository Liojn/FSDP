import React, { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RecommendationCardProps } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const RecommendationCard: React.FC<RecommendationCardProps> = memo(
  ({ rec }) => {
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{rec.title || "Untitled Recommendation"}</CardTitle>
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
          <p className="mb-2">
            {rec.description || "No description provided."}
          </p>
          <p className="mb-4">
            <strong>Impact:</strong> {rec.impact || "Not specified."}
          </p>
          {rec.implementationSteps?.length > 0 && (
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
                {rec.estimatedEmissionReduction
                  ? `${rec.estimatedEmissionReduction.toLocaleString()} CO₂e (kg) / Year`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                {rec.relatedMetrics && rec.relatedMetrics.length > 0 && (
                  <p className="text-sm text-gray-500">
                    Related Metrics: {rec.relatedMetrics.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Collapsible Tracking Section */}
          <div className="mt-6">
            <Collapsible open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline">
                  {isTrackingOpen ? "Hide Tracking" : "Track Progress"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Track Progress</h4>
                  <div className="flex flex-col gap-2">
                    {rec.implementationSteps?.map((step, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border rounded px-4 py-2"
                      >
                        <span>{step}</span>
                        <Button variant="ghost">Mark Complete</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Compare props for memoization
    return prevProps.rec.id === nextProps.rec.id;
  }
);

RecommendationCard.displayName = "RecommendationCard";
export default RecommendationCard;
