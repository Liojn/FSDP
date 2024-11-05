import { Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeTier {
  name: string;
  color: string;
  minReduction: number;
  icon: React.ReactNode;
}

const badgeTiers: BadgeTier[] = [
  {
    name: "Bronze",
    color: "bg-amber-600",
    minReduction: 5000,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    name: "Silver",
    color: "bg-gray-400",
    minReduction: 10000,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    name: "Gold",
    color: "bg-yellow-400",
    minReduction: 20000,
    icon: <Shield className="h-6 w-6" />,
  },
  {
    name: "Platinum",
    color: "bg-cyan-500",
    minReduction: 50000,
    icon: <Shield className="h-6 w-6" />,
  },
];

interface SustainabilityBadgeProps {
  targetReduction: number;
}

export const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({
  targetReduction,
}) => {
  const currentBadge = badgeTiers.reduce((prev, curr) => {
    return targetReduction >= curr.minReduction ? curr : prev;
  }, badgeTiers[0]);

  const nextBadge = badgeTiers.find(
    (badge) => badge.minReduction > targetReduction
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
              ${currentBadge.color} 
              p-3 rounded-full 
              text-white
              transition-all 
              hover:scale-110
            `}
            >
              {currentBadge.icon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-semibold">{currentBadge.name} Badge</p>
              <p>Current Goal: {targetReduction.toLocaleString()} kg CO₂</p>
              {nextBadge && (
                <p className="text-xs text-gray-500 mt-1">
                  Next tier ({nextBadge.name}):
                  {nextBadge.minReduction.toLocaleString()} kg CO₂
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
