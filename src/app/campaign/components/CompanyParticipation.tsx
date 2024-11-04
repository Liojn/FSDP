import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface CompanyParticipationProps {
  company: {
    name: string;
    targetReduction: number;
    currentProgress: number;
    joinedAt: string;
  };
}

export function CompanyParticipation({ company }: CompanyParticipationProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-lime-700">
        Your Company&apos;s Participation
      </h2>
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            {company.name} is already participating in this campaign
          </AlertDescription>
        </Alert>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Target Reduction</p>
            <p className="text-xl font-bold text-lime-600">
              {company.targetReduction.toLocaleString()} tons
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Progress</p>
            <div className="space-y-2">
              <Progress
                value={
                  (company.currentProgress / company.targetReduction) * 100
                }
                className="h-2"
              />
              <p className="text-xl font-bold text-lime-600">
                {company.currentProgress.toLocaleString()} tons
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Joined Date</p>
            <p className="text-base">
              {new Date(company.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
