import { Progress } from "@/components/ui/progress";

interface CampaignProgressProps {
  currentProgress: number;
  targetReduction: number;
  startDate: Date;
  endDate: Date;
}

export default function CampaignProgress({
  currentProgress = 0, // Add default value
  targetReduction = 0, // Add default value
  startDate,
  endDate,
}: CampaignProgressProps) {
  const progressPercentage = !targetReduction
    ? 0
    : (currentProgress / targetReduction) * 100;
  const isGoalExceeded = progressPercentage > 100;

  // Safely format numbers with fallback
  const formattedCurrent = currentProgress?.toLocaleString() ?? "0";
  const formattedTarget = targetReduction?.toLocaleString() ?? "0";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Campaign Progress
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Current Progress</p>
          <p className="text-2xl font-bold ">{formattedCurrent} (kg CO₂e) </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Target Reduction</p>
          <p className="text-2xl font-bold ">{formattedTarget} (kg CO₂e)</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="space-y-2 mb-4">
        <Progress
          value={isGoalExceeded ? 100 : progressPercentage}
          className={`h-2 ${isGoalExceeded ? "bg-lime-600" : ""}`}
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
      </div>
    </div>
  );
}
