import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
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
  };
  progress: number;
}

export const ParticipantsTable = ({
  participants = [],
}: {
  participants: Participant[];
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: string;
  }>({
    key: null,
    direction: "ascending",
  });

  // Sorting function
  const sortedParticipants = React.useMemo(() => {
    if (!sortConfig.key) return participants;

    return [...participants].sort((a, b) => {
      if (sortConfig.key === "company") {
        const aValue = a.company.name.toLowerCase();
        const bValue = b.company.name.toLowerCase();
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      }

      if (sortConfig.key === "progress") {
        return sortConfig.direction === "ascending"
          ? a.progress - b.progress
          : b.progress - a.progress;
      }
      return 0;
    });
  }, [participants, sortConfig]);

  // Handle sort
  const requestSort = (key: string | null) => {
    setSortConfig((current) => {
      if (current.key === key && current.direction === "ascending") {
        return { key, direction: "descending" };
      }
      if (current.key === key && current.direction === "descending") {
        return { key: null, direction: "ascending" };
      }
      return { key, direction: "ascending" };
    });
  };

  // Get sort direction icon
  const getSortIcon = (columnKey: string | null) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-500" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-2 h-4 w-4 text-gray-900" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4 text-gray-900" />
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6 text-lime-700">
        Campaign Participants
      </h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => requestSort("company")}
              >
                <div className="flex items-center">
                  Company Name
                  {getSortIcon("company")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => requestSort("progress")}
              >
                <div className="flex items-center">
                  Progress
                  {getSortIcon("progress")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParticipants.map((participant, index) => (
              <TableRow key={index}>
                <TableCell>{participant.company.name}</TableCell>
                <TableCell className="w-64">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={participant.progress}
                      max={100}
                      className="h-2"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {participant.progress}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedParticipants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-4 text-gray-500"
                >
                  No participants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ParticipantsTable;
