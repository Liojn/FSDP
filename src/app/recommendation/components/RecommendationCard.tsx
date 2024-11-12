/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/RecommendationCard.tsx

import React, { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecommendationCardProps } from "@/types";

const RecommendationCard: React.FC<RecommendationCardProps> = memo(
  ({ rec, isImplemented, toggleRecommendation }) => {
    // Log every time the component renders
    console.log(`Rendering RecommendationCard: ${rec.title}`);

    // Memoize the click handler to prevent recreating the function on every render
    const handleImplementationToggle = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleRecommendation(rec.title);
      },
      [toggleRecommendation, rec.title]
    );

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
                {rec.priority !== undefined && (
                  <span className="text-sm px-2 py-1 rounded-full border">
                    Priority {rec.priority}
                  </span>
                )}
                {rec.roi !== undefined && (
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
            {rec.steps.map(
              (
                step:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<React.AwaitedReactNode>
                  | null
                  | undefined,
                index: React.Key | null | undefined
              ) => (
                <li key={index}>{step}</li>
              )
            )}
          </ol>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>
                Potential Savings: ${rec.savings.toLocaleString()}/year
              </span>
              <Button
                variant={isImplemented ? "secondary" : "default"}
                onClick={handleImplementationToggle}
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
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in Dashboard →
                </a>
              </div>
            )}
            {rec.scope && (
              <span className="text-sm text-gray-500">Scope: {rec.scope}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
  // Add a custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.rec.title === nextProps.rec.title &&
      prevProps.isImplemented === nextProps.isImplemented &&
      prevProps.rec.savings === nextProps.rec.savings
    );
  }
);

RecommendationCard.displayName = "RecommendationCard";
export default RecommendationCard;
