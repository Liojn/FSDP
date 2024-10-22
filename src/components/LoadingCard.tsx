// components/LoadingCard.tsx

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const LoadingCard = () => (
  <Card className="mb-4">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-20 w-full" />
    </CardContent>
  </Card>
)

export default LoadingCard
