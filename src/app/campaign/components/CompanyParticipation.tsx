"use client";

import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface CompanyParticipationProps {
  company: {
    name: string;
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
      </div>
    </Card>
  );
}
