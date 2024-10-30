import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { StepProps } from "../types";
import { TextInput } from "./TextInput";

export const Step1: React.FC<StepProps> = ({ form }) => (
  <div className="space-y-6">
    <CardHeader>
      <CardTitle>Company Information</CardTitle>
      <CardDescription>
        Please provide some basic details about your company.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <TextInput
        label="Company Name"
        placeholder="Enter company name"
        name="companyInfo.companyName"
        control={form.control}
      />
      <TextInput
        label="Industry"
        placeholder="Enter industry sector"
        name="companyInfo.industry"
        control={form.control}
      />
      <FormField
        control={form.control}
        name="companyInfo.size"
        render={({ field, fieldState }) => (
          <FormItem className="relative">
            <FormLabel>Company Size</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter number of employees"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value || ""}
                  className={fieldState.error ? "border-red-300 pr-10" : ""}
                />
              </FormControl>
              {fieldState.error && (
                <TooltipProvider delayDuration={1}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{fieldState.error.message}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <FormMessage className="text-xs text-red-400 mt-1" />
          </FormItem>
        )}
      />
      <TextInput
        label="Email"
        placeholder="Enter email address"
        name="companyInfo.email"
        type="email"
        control={form.control}
      />
      <TextInput
        label="Contact Person"
        placeholder="Enter contact person's name"
        name="companyInfo.contactPerson"
        control={form.control}
      />
    </CardContent>
  </div>
);
