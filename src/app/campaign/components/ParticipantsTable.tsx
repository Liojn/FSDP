"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming you have a Progress component in Shadcn

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  ColumnDef,
  SortingState,
  Updater,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface Participant {
  company: {
    name: string;
  };
  progress: number; // Track current progress as a percentage
}

interface ParticipantsTableProps {
  participants: Participant[];
}

// Update columns to show company name and progress as a progress bar
const columns: ColumnDef<Participant>[] = [
  {
    accessorFn: (row) => row.company.name,
    header: "Company Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorFn: (row) => row.progress,
    header: "Progress",
    cell: (info) => (
      <Progress value={info.getValue() as number} max={100} className=" h-2" /> // Customize the width and height as needed
    ),
  }
];

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Update sorting state to only keep the most recent column sorted
  const handleSortingChange = (updaterOrValue: Updater<SortingState>) => {
    setSorting((old) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(old)
          : updaterOrValue;
      return [newSorting[newSorting.length - 1]];
    });
  };

  // Initialize the table with sorting functionality
  const table = useReactTable({
    data: participants,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6 text-lime-700">
        Campaign Participants
      </h2>
      <Card>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
