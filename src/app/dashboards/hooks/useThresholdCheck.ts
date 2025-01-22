// hooks/useThresholdCheck.ts

import { useEffect, useState } from "react";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
} from "@/app/dashboards/utils/scopeCalculations";
import { EmissionData } from "@/types";

export const useThresholdCheck = (
  userId: string,
  year: number,
  month?: number
) => {
  const [loading, setLoading] = useState(true);
  const [exceedingScopes, setExceedingScopes] = useState<string[]>([]);
  const [thresholds, setThresholds] = useState([]);
  const [data, setData] = useState<EmissionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThresholdsAndEmissions = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Fetch thresholds and emissions data
        const [thresholdsRes, emissionsRes] = await Promise.all([
          fetch(`/api/thresholds?userId=${userId}`),
          fetch(
            `/api/dashboards/popup/${userId}?year=${year}${
              month ? `&month=${month}` : ""
            }`
          ),
        ]);

        if (!thresholdsRes.ok || !emissionsRes.ok) {
          throw new Error("Failed to fetch thresholds or emissions data");
        }

        const thresholdsData = await thresholdsRes.json();
        const emissionsData = await emissionsRes.json();

        if (emissionsData.success) {
          const emissions = emissionsData.data;

          setData(emissions);
          setThresholds(thresholdsData.thresholds);

          // Calculate scope values
          const scope1 = calculateScope1(emissions);
          const scope2 = calculateScope2(emissions);
          const scope3 = calculateScope3(emissions);

          // Check exceeding thresholds
          const exceeding = thresholdsData.thresholds
            .filter((threshold: any) => {
              if (threshold.scope === "Scope 1" && scope1 > threshold.value)
                return true;
              if (threshold.scope === "Scope 2" && scope2 > threshold.value)
                return true;
              if (threshold.scope === "Scope 3" && scope3 > threshold.value)
                return true;
              return false;
            })
            .map((threshold: any) => threshold.scope);

          setExceedingScopes(exceeding);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchThresholdsAndEmissions();
  }, [userId, year, month]);

  return { data, thresholds, exceedingScopes, loading, error };
};
