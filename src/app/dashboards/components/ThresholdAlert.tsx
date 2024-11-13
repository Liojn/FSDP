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

interface ScopeThreshold {
  id: string;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  description: string;
  value: number;
  unit: string;
}

interface ThresholdAlert {
  id: string;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  description: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  timestamp: Date;
}

interface ScopeMetrics {
  scope1: number;
  scope2: number;
  scope3: number;
}

interface ThresholdAlertProps {
  metrics: MetricData;
  onViewRecommendations: (scope: string) => void;
}

function convertMetricsToScope(metrics: MetricData): ScopeMetrics {
  // Scope 1: Direct emissions from owned sources (livestock + equipment)
  const scope1 =
    metrics.livestock.emissions +
    (metrics.emissions.byCategory["equipment"] || 0);

  // Scope 2: Indirect emissions from purchased energy
  const scope2 = metrics.energy.consumption;

  // Scope 3: All other indirect emissions (waste + crops + other categories)
  const scope3 = metrics.emissions.total - (scope1 + scope2);

  return {
    scope1,
    scope2,
    scope3: Math.max(0, scope3), // Ensure we don't get negative values
  };
}

export default function ThresholdAlert({
  metrics,
  onViewRecommendations,
}: ThresholdAlertProps) {
  const [alerts, setAlerts] = useState<ThresholdAlert[]>([]);
  const [thresholds, setThresholds] = useState<ScopeThreshold[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    // Only fetch thresholds if userId exists
    if (!userId) return;

    const fetchThresholds = async () => {
      try {
        const response = await fetch(`/api/thresholds?userId=${userId}`);
        const data = await response.json();
        setThresholds(data.thresholds || []);
      } catch (error) {
        console.error("Failed to fetch thresholds:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch thresholds",
        });
      }
    };

    fetchThresholds();
  }, []); // Empty dependency array to fetch only once

  useEffect(() => {
    if (thresholds.length === 0) return;

    // Convert metrics to scope format
    const scopeMetrics = convertMetricsToScope(metrics);

    // Check each threshold against current metrics
    const newAlerts: ThresholdAlert[] = [];

    thresholds.forEach((threshold) => {
      let currentValue = 0;

      // Map threshold scopes to metric values
      switch (threshold.scope) {
        case "Scope 1":
          currentValue = scopeMetrics.scope1;
          break;
        case "Scope 2":
          currentValue = scopeMetrics.scope2;
          break;
        case "Scope 3":
          currentValue = scopeMetrics.scope3;
          break;
        default:
          return;
      }

      // Create alert if threshold is exceeded
      if (currentValue > threshold.value) {
        newAlerts.push({
          id: threshold.id,
          scope: threshold.scope,
          description: threshold.description,
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
        description: `${newAlerts.length} emission ${
          newAlerts.length === 1 ? "scope has" : "scopes have"
        } exceeded their thresholds`,
      });
    }
  }, [metrics, thresholds, toast]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {alerts.map((alert) => (
        <Card key={alert.id} className="border-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">
                {alert.scope} Alert
              </CardTitle>
            </div>
            <CardDescription>{alert.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Current Value
                  </p>
                  <p className="text-lg font-semibold text-red-500">
                    {alert.currentValue.toFixed(2)} {alert.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Threshold</p>
                  <p className="text-lg font-semibold">
                    {alert.thresholdValue.toFixed(2)} {alert.unit}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => onViewRecommendations(alert.scope)}
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
