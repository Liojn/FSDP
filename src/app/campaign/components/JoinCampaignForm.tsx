"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CompanyFormValues,
  companyFormSchema,
} from "../types";

interface JoinCampaignFormProps {
  onSubmit: (
    companyValues: CompanyFormValues,
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



  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-lime-700">
        Join the Campaign
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const companyValues = companyForm.getValues();
          onSubmit(companyValues);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          {/* should be autofilled if you are logged in */}
          <Label htmlFor="name" className="text-lime-700">
            Company Name
          </Label>
          <Input disabled id="name" type="text" {...companyForm.register("name")} />
          {companyForm.formState.errors.name && (
            <p className="text-red-500 text-sm">
              {companyForm.formState.errors.name.message}
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
