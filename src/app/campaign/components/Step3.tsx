import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepProps } from "../types";

export const Step3: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-6">
    <CardHeader>
      <CardTitle>Reporting Preferences</CardTitle>
      <CardDescription>
        Select how you&apos;d prefer to track and report your progress.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <FormField
        control={form.control}
        name="reportingPreferences.frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reporting Frequency</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              How often would you like to report your progress?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="reportingPreferences.format"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reporting Format</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="Web Dashboard">Web Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              Choose your preferred format for reports.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="reportingPreferences.notifications"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id="notifications"
              />
            </FormControl>
            <FormLabel htmlFor="notifications">
              Enable Email Notifications
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </div>
);
