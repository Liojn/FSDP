import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Participant {
  company: {
    name: string;
    size: string;
  };
  participation: {
    targetReduction: number;
    currentProgress: number;
    joinedAt: string;
  };
}

interface ParticipantsTableProps {
  participants: Participant[];
}

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6 text-lime-700">
        Campaign Participants
      </h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Target Reduction</TableHead>
              <TableHead>Current Progress</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p, index) => (
              <TableRow key={index}>
                <TableCell>{p.company.name}</TableCell>
                <TableCell>{p.company.size}</TableCell>
                <TableCell>
                  {p.participation.targetReduction.toLocaleString()} tons
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={
                        (p.participation.currentProgress /
                          p.participation.targetReduction) *
                        100
                      }
                      className="w-24 h-2"
                    />
                    <span>
                      {p.participation.currentProgress.toLocaleString()} tons
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(p.participation.joinedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
