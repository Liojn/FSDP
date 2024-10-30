import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepProps } from "../types";
import { TextInput } from "./TextInput";
import { SustainabilityBadge } from "@/components/shared/SustainabilityBadge";

export const Step2: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-6">
    <CardHeader>
      <CardTitle>Sustainability Goals</CardTitle>
      <CardDescription>
        Please specify your sustainability goals and targets.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <TextInput
        label="Target Year"
        placeholder="Enter target year"
        name="sustainabilityGoals.targetYear"
        type="number"
        control={form.control}
        description="The year by which you aim to achieve your goals."
      />
      <TextInput
        label="Baseline Year"
        placeholder="Enter baseline year"
        name="sustainabilityGoals.baselineYear"
        type="number"
        control={form.control}
        description="The year from which you're measuring progress."
      />
      <FormField
        control={form.control}
        name="sustainabilityGoals.emissionsTarget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Emissions Reduction Target (kg CO₂)</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter target reduction"
                  {...field}
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                />
              </FormControl>
              <SustainabilityBadge targetReduction={field.value || 0} />
            </div>
            <FormDescription>
              Set your CO₂ reduction goal to earn achievement badges
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="sustainabilityGoals.energyTarget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Energy Reduction Target (kWh)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter energy target"
                {...field}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  field.onChange(value);
                }}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <TextInput
        label="Water Target (liters)"
        placeholder="Enter water target"
        name="sustainabilityGoals.waterTarget"
        type="number"
        control={form.control}
      />
    </CardContent>
  </div>
);
