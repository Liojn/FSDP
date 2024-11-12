import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RecommendationAlertProps {
  exceedingScopes: string[];
  onViewRecommendations: () => void;
}

const RecommendationAlert: React.FC<RecommendationAlertProps> = ({
  exceedingScopes,
  onViewRecommendations,
}) => {
  if (!exceedingScopes || exceedingScopes.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-600 font-semibold">
        Emission Threshold Exceeded
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-red-600 mb-3">
          The following scopes have exceeded their thresholds:
          <ul className="list-disc list-inside mt-1">
            {exceedingScopes.map((scope, index) => (
              <li key={index}>{scope}</li>
            ))}
          </ul>
        </div>
        <Button
          onClick={onViewRecommendations}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          View Recommendations
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default RecommendationAlert;
