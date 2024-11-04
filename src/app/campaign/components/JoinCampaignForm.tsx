import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CompanyFormValues,
  ParticipationFormValues,
  CompanySize,
  companyFormSchema,
  participationFormSchema,
} from "../types";

interface JoinCampaignFormProps {
  onSubmit: (
    companyValues: CompanyFormValues,
    participationValues: ParticipationFormValues
  ) => Promise<void>;
  submitting: boolean;
}

export function JoinCampaignForm({
  onSubmit,
  submitting,
}: JoinCampaignFormProps) {
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    mode: "onChange",
  });

  const participationForm = useForm<ParticipationFormValues>({
    resolver: zodResolver(participationFormSchema),
    mode: "onChange",
  });

  const [targetRange, setTargetRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      const storedUserEmail = localStorage.getItem("userEmail");

      if (storedUserName) {
        companyForm.setValue("name", storedUserName);
      }
      if (storedUserEmail) {
        companyForm.setValue("email", storedUserEmail);
      }
    }
  }, [companyForm]);

  useEffect(() => {
    const size = companyForm.watch("size");

    if (size) {
      const sizeMultipliers: Record<CompanySize, number> = {
        Small: 1000,
        Medium: 5000,
        Large: 10000,
      };
      setTargetRange({
        min: sizeMultipliers[size as CompanySize] * 0.5,
        max: sizeMultipliers[size as CompanySize] * 1.5,
      });
    }
  }, [companyForm]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-lime-700">
        Join the Campaign
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const companyValues = companyForm.getValues();
          const participationValues = participationForm.getValues();
          onSubmit(companyValues, participationValues);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-lime-700">
            Company Name
          </Label>
          <Input id="name" type="text" {...companyForm.register("name")} />
          {companyForm.formState.errors.name && (
            <p className="text-red-500 text-sm">
              {companyForm.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="size" className="text-lime-700">
            Company Size
          </Label>
          <Select
            onValueChange={(value) =>
              companyForm.setValue("size", value as CompanySize)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Small">Small (1-50 employees)</SelectItem>
              <SelectItem value="Medium">Medium (51-250 employees)</SelectItem>
              <SelectItem value="Large">Large (250+ employees)</SelectItem>
            </SelectContent>
          </Select>
          {companyForm.formState.errors.size && (
            <p className="text-red-500 text-sm">
              {companyForm.formState.errors.size.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetReduction" className="text-lime-700">
            Planned Target Reduction (tons)
          </Label>
          <Input
            id="targetReduction"
            type="number"
            min="1"
            {...participationForm.register("targetReduction", {
              valueAsNumber: true,
            })}
          />
          {targetRange && (
            <p className="text-sm text-gray-600">
              Recommended range: {targetRange.min.toLocaleString()} -{" "}
              {targetRange.max.toLocaleString()} tons
            </p>
          )}
          {participationForm.formState.errors.targetReduction && (
            <p className="text-red-500 text-sm">
              {participationForm.formState.errors.targetReduction.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPerson" className="text-lime-700">
            Contact Person
          </Label>
          <Input
            id="contactPerson"
            type="text"
            {...companyForm.register("contactPerson")}
          />
          {companyForm.formState.errors.contactPerson && (
            <p className="text-red-500 text-sm">
              {companyForm.formState.errors.contactPerson.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-lime-700">
            Email
          </Label>
          <Input id="email" type="email" {...companyForm.register("email")} />
          {companyForm.formState.errors.email && (
            <p className="text-red-500 text-sm">
              {companyForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-lime-600 hover:bg-lime-700 text-white"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Join Campaign"
          )}
        </Button>
      </form>
    </Card>
  );
}
