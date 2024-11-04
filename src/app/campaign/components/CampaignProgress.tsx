import { Progress } from "@/components/ui/progress";

interface CampaignProgressProps {
  totalReduction: number;
  targetReduction: number;
  startDate: Date;
  endDate: Date;
  signeesCount: number;
}

export function CampaignProgress({
  totalReduction,
  targetReduction,
  startDate,
  endDate,
  signeesCount,
}: CampaignProgressProps) {
  const progressPercentage = (totalReduction / targetReduction) * 100;

  return (
    <div>
      {" "}
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Campaign Progress
      </h2>
      {/* Progress bar */}
      <div className="space-y-2 mb-4">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-sm text-gray-600 text-right">
          {progressPercentage.toFixed(1)}%
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
          <p className="text-sm text-gray-600">Total Reduction Achieved</p>
          <p className="text-2xl font-bold text-lime-600">
            {totalReduction.toLocaleString()} tons
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Reduction Target</p>
          <p className="text-2xl font-bold text-lime-600">
            {targetReduction.toLocaleString()} tons
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Number of Participants</p>
          <p className="text-2xl font-bold text-lime-600">{signeesCount}</p>
        </div>
      </div>
    </div>
  );
}
