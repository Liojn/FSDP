import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RecommendationSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="w-full">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Title */}
              <Skeleton className="h-7 w-1/3 mb-4" />

              {/* Description */}
              <Skeleton className="h-5 w-11/12" />

              {/* Impact section */}
              <div className="mt-2">
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-5 w-14" /> {/* "Impact:" text */}
                  <Skeleton className="h-5 w-3/4" /> {/* Impact content */}
                </div>
              </div>

              {/* Steps to Implement section */}
              <div className="mt-2">
                <Skeleton className="h-5 w-36 mb-2" />{" "}
                {/* "Steps to Implement:" text */}
                <div className="space-y-2 pl-6">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" /> {/* Number bullet */}
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" /> {/* Number bullet */}
                    <Skeleton className="h-5 w-1/4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" /> {/* Number bullet */}
                    <Skeleton className="h-5 w-1/3" />
                  </div>
                </div>
              </div>

              {/* Bottom row with savings and button */}
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-5 w-32" /> {/* Potential Savings text */}
                <Skeleton className="h-9 w-40 rounded-md" />{" "}
                {/* Implementation button */}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecommendationSkeleton;
