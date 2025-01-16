import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RecommendationSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="w-full">
          <CardContent className="p-6">
            <Skeleton className="h-7 w-1/3 mb-4" />
            <Skeleton className="h-5 w-11/12" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecommendationSkeleton;
