import { useEffect, useState } from "react";
import { calculateScope1, calculateScope2, calculateScope3 } from "@/app/dashboards/utils/scopeCalculations";
import { EmissionData } from "@/types"; // or wherever you store types

interface ScopeExceedance {
  scope: string;       // "Scope 1", "Scope 2", or "Scope 3"
  exceededBy: number;  // e.g. 20
  unit: string;        // e.g. "kg CO₂"
}

// Adjust if you have a dedicated interface for thresholds
interface Threshold {
  scope: string;
  value: number;
  unit: string;
  // ... maybe id, description, etc.
}

export const useThresholdCheck = (
  userId: string,
  year: number,
  month?: number
) => {
  const [loading, setLoading] = useState(true);
  const [exceedingScopes, setExceedingScopes] = useState<string[]>([]);
  const [exceedances, setExceedances] = useState<ScopeExceedance[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
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
          fetch(`/api/dashboards/popup/${userId}?year=${year}${month ? `&month=${month}` : ""}`),
        ]);

        if (!thresholdsRes.ok || !emissionsRes.ok) {
          throw new Error("Failed to fetch thresholds or emissions data");
        }

        const thresholdsData = await thresholdsRes.json();
        const emissionsData = await emissionsRes.json();

        if (emissionsData.success) {
          const emissions = emissionsData.data;
          setData(emissions);

          // Convert if needed; if thresholdsData.thresholds is the actual array:
          const thresholdArr: Threshold[] = thresholdsData.thresholds || [];
          setThresholds(thresholdArr);

          // Calculate scope values
          const scope1 = calculateScope1(emissions);
          const scope2 = calculateScope2(emissions);
          const scope3 = calculateScope3(emissions);

          // Determine which scopes exceeded and by how much
          const newExceedances: ScopeExceedance[] = thresholdArr
            .filter((threshold) => {
              if (threshold.scope === "Scope 1" && scope1 > threshold.value) return true;
              if (threshold.scope === "Scope 2" && scope2 > threshold.value) return true;
              if (threshold.scope === "Scope 3" && scope3 > threshold.value) return true;
              return false;
            })
            .map((threshold) => {
              let actualValue = 0;
              if (threshold.scope === "Scope 1") actualValue = scope1;
              if (threshold.scope === "Scope 2") actualValue = scope2;
              if (threshold.scope === "Scope 3") actualValue = scope3;

              return {
                scope: threshold.scope,
                exceededBy: actualValue - threshold.value,
                unit: threshold.unit,
              };
            });

          setExceedances(newExceedances);
          setExceedingScopes(newExceedances.map((exc) => exc.scope));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchThresholdsAndEmissions();
  }, [userId, year, month]);

  return {
    data,
    thresholds,
    exceedingScopes,  // e.g. ["Scope 1", "Scope 3"]
    exceedances,      // e.g. [{ scope: "Scope 1", exceededBy: 20, unit: "kg CO₂" }, ...]
    loading,
    error,
  };
};
