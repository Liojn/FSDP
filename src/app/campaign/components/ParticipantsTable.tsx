"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CaretSortIcon } from "@radix-ui/react-icons";
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

// Define the columns for the table
const columns: ColumnDef<Participant>[] = [
  {
    accessorKey: "company.name",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className=" flex items-center space-x-1"
      >
        Company
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </button>
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "company.size",
    header: "Size",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "participation.targetReduction",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-1"
      >
        Target Reduction (tons)
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </button>
    ),
    cell: (info) => (info.renderValue() as number).toLocaleString(),
  },
  {
    accessorKey: "participation.currentProgress",
    header: "Current Progress",
    cell: ({ row }) => {
      const progress = row.original.participation.currentProgress;
      const target = row.original.participation.targetReduction;
      const percentage = (progress / target) * 100;
      return (
        <div className="flex items-center space-x-2">
          <Progress value={percentage} className="w-24 h-2" />
          <span>
            {progress.toLocaleString()} tons ({percentage.toFixed(1)}%)
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "participation.joinedAt",
    header: "Joined",
    cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
  },
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
