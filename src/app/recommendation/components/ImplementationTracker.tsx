import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImplementationTrackerProps } from "@/types/";

const ImplementationTracker: React.FC<ImplementationTrackerProps> = ({
  recommendation,
  progress,
}) => {
  // Calculate estimated completion date (example: 30 days from implementation)
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + 30);

  // Format the date
  const formattedDate = estimatedCompletion.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{recommendation.title}</h3>
              <p className="text-sm text-gray-600">
                {recommendation.description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">
                Est. Completion: {formattedDate}
              </span>
              {recommendation.roi && (
                <div className="text-sm text-green-600">
                  ROI: {recommendation.roi}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Implementation Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {recommendation.steps && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Implementation Steps:</h4>
              <ul className="space-y-1">
                {recommendation.steps.map((step: string, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={
                        progress > (index / recommendation.steps.length) * 100
                      }
                      readOnly
                      className="mr-2"
                    />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.difficulty && (
            <div className="flex items-center space-x-2 text-sm">
              <span>Difficulty:</span>
              <span
                className={`font-medium ${
                  recommendation.difficulty === "easy"
                    ? "text-green-600"
                    : recommendation.difficulty === "medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {recommendation.difficulty.charAt(0).toUpperCase() +
                  recommendation.difficulty.slice(1)}
              </span>
            </div>
          )}

          {recommendation.dashboardLink && (
            <div className="text-sm">
              <a
                href={recommendation.dashboardLink}
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
};

export default ImplementationTracker;
