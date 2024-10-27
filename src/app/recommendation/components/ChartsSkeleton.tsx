// ChartsSkeleton.tsx

import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const ChartsSkeleton: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bar Chart Placeholder */}
          <div className="col-span-1 md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          {/* Areas for Improvement Placeholder */}
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <ul className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <li key={index}>
                  <Skeleton className="h-4 w-full" />
                </li>
              ))}
            </ul>
          </div>
          {/* Pie Chart Placeholder */}
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChartsSkeleton
