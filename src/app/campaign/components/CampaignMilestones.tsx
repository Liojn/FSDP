interface Milestone {
  percentage: number;
  reached: boolean;
  reachedAt?: string;
}

interface CampaignMilestonesProps {
  milestones: Milestone[];
}

export function CampaignMilestones({ milestones }: CampaignMilestonesProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Campaign Milestones</h3>
      <div className="space-y-2">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              milestone.reached
                ? "bg-lime-100 text-lime-500"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{milestone.percentage}% Target Reached</span>
              {milestone.reached && (
                <span className="text-sm">
                  {new Date(milestone.reachedAt!).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
