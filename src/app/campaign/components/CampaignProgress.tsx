import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface CampaignProgressProps {
  currentProgress: number;
  targetReduction: number;
  startDate: Date;
  endDate: Date;
}

export function CampaignProgress({
  currentProgress,
  targetReduction,
  startDate,
  endDate,
}: CampaignProgressProps) {
  const [signeesCount, setSigneesCount] = useState(0);
  const progressPercentage = !targetReduction ? 0 : (currentProgress / targetReduction) * 100;
  const isGoalExceeded = progressPercentage > 100;

  useEffect(() => {
    const fetchSigneesCount = async () => {
      try {
        const response = await fetch('/api/campaign/participants/count');
        const data = await response.json();
        setSigneesCount(data.count);
      } catch (error) {
        console.error('Failed to fetch signees count:', error);
      }
    };

    fetchSigneesCount();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Campaign Progress
      </h2>
      {/* Progress bar */}
      <div className="space-y-2 mb-4">
        <Progress
          value={isGoalExceeded ? 100 : progressPercentage}
          className={`h-2 ${isGoalExceeded ? "bg-green-600" : ""}`}
        />
        <p className="text-sm text-gray-600 text-right">
          {isGoalExceeded
            ? `Goal Exceeded! ${progressPercentage.toFixed(1)}%`
            : `${progressPercentage.toFixed(1)}%`}
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Campaign Period</p>
          <p className="text-base">
            {new Date(startDate).toLocaleDateString()} -{" "}
            {new Date(endDate).toLocaleDateString()}
          </p>
        </div>
        <div>

        </div>
        <div>

        </div>
        <div>
          <p className="text-sm text-gray-600">Number of Participants</p>
          <p className="text-2xl font-bold text-lime-600">{signeesCount}</p>
        </div>
      </div>
    </div>
  );
}
