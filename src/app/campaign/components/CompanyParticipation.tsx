"use client";

import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress"; // Import Progress component

export interface CompanyParticipationProps {
  company: {
    name: string;
    currentProgress: number; // Added currentProgress
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

        {/* Display Company's Current Progress */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">Current Progress</p>
          <p className="text-2xl font-bold text-lime-600">
            {company.currentProgress.toLocaleString()} tons
          </p>
          <Progress value={company.currentProgress} className="h-3" />
        </div>
      </div>
    </Card>
  );
}
