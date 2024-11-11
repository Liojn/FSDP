"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { MetricData } from "@/types";

interface Threshold {
  id: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
}

interface ThresholdAlert {
  id: string;
  category: string;
  metric: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  timestamp: Date;
}

interface ThresholdMetrics {
  energy: { consumption: number };
  emissions: { total: number };
  waste: { quantity: number };
  fuel: { usage: number };
}

interface ThresholdAlertProps {
  metrics: MetricData;
  onViewRecommendations: (category: string) => void;
}

function convertMetricsForThreshold(metrics: MetricData): ThresholdMetrics {
  return {
    energy: { consumption: metrics.energy.consumption },
    emissions: { total: metrics.emissions.total },
    waste: { quantity: metrics.waste.quantity },
    fuel: { usage: metrics.livestock.emissions }, // Using livestock emissions as a proxy for fuel usage
  };
}

export default function ThresholdAlert({
  metrics,
  onViewRecommendations,
}: ThresholdAlertProps) {
  const [alerts, setAlerts] = useState<ThresholdAlert[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkThresholds();
  }, [metrics]);

  const checkThresholds = async () => {
    try {
      // Fetch current thresholds
      const response = await fetch("/api/thresholds");
      const data = await response.json();
      const thresholds: Threshold[] = data.thresholds;

      // Convert metrics to threshold format
      const thresholdMetrics = convertMetricsForThreshold(metrics);

      // Check each threshold against current metrics
      const newAlerts: ThresholdAlert[] = [];

      thresholds.forEach((threshold) => {
        let currentValue = 0;

        // Map threshold categories to metric values
        switch (threshold.category) {
          case "energy":
            currentValue = thresholdMetrics.energy.consumption;
            break;
          case "emissions":
            currentValue = thresholdMetrics.emissions.total;
            break;
          case "waste":
            currentValue = thresholdMetrics.waste.quantity;
            break;
          case "fuel":
            currentValue = thresholdMetrics.fuel.usage;
            break;
          default:
            return;
        }

        // Create alert if threshold is exceeded
        if (currentValue > threshold.value) {
          newAlerts.push({
            id: threshold.id,
            category: threshold.category,
            metric: threshold.metric,
            currentValue,
            thresholdValue: threshold.value,
            unit: threshold.unit,
            timestamp: new Date(),
          });
        }
      });

      // Update alerts state
      setAlerts(newAlerts);

      // Show toast notification for new alerts
      if (newAlerts.length > 0) {
        toast({
          variant: "destructive",
          title: "Threshold Alert",
          description: `${newAlerts.length} metrics have exceeded their thresholds`,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check thresholds",
      });
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {alerts.map((alert) => (
        <Card key={alert.id} className="border-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">
                {alert.metric} Alert
              </CardTitle>
            </div>
            <CardDescription>
              Threshold exceeded for {alert.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Current Value
                  </p>
                  <p className="text-lg font-semibold text-red-500">
                    {alert.currentValue} {alert.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Threshold</p>
                  <p className="text-lg font-semibold">
                    {alert.thresholdValue} {alert.unit}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => onViewRecommendations(alert.category)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  View Recommendations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
