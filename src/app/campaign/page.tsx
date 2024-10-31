"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CampaignData, FormValues, Signee, formSchema } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { Label } from "@/components/ui/label";

export default function CampaignPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      companyInfo: {
        companyName: "",
        industry: "",
        targetReduction: undefined,
        contactPerson: "",
        email: "",
      },
    },
  });

  useEffect(() => {
    // Fetch campaign data from API
    const fetchCampaignData = async () => {
      try {
        const response = await fetch("/api/campaign");
        if (!response.ok) {
          throw new Error("Failed to fetch campaign data");
        }
        const data = await response.json();
        setCampaignData(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/campaign/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join campaign");
      }

      const newSignee: Signee = {
        companyName: values.companyInfo.companyName,
        industry: values.companyInfo.industry,
        reduction: values.companyInfo.targetReduction!,
        joinedAt: new Date().toISOString(),
      };

      // Update campaign data with the new signee
      setCampaignData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          totalReduction: prevData.totalReduction + newSignee.reduction,
          signees: [newSignee, ...prevData.signees],
        };
      });

      form.reset();
      toast({
        title: "Success",
        description: "Successfully joined the campaign!",
        className: "bg-green-100 border-green-200",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-red-100 border-red-200",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No campaign data available
      </div>
    );
  }

  const progressPercentage =
    (campaignData.totalReduction / campaignData.targetReduction) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Join Our Sustainability Campaign" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Progress Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Campaign Progress
          </h2>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
            <div
              className="bg-lime-500 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Reduction Achieved</p>
              <p className="text-2xl font-bold text-lime-600">
                {campaignData.totalReduction} tons
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reduction Target</p>
              <p className="text-2xl font-bold text-lime-600">
                {campaignData.targetReduction} tons
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Participants</p>
              <p className="text-2xl font-bold text-lime-600">
                {campaignData.signees.length}
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-lime-700">
            Join the Campaign
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-lime-700">
                Company Name
              </Label>
              <Input
                id="companyName"
                type="text"
                {...form.register("companyInfo.companyName")}
              />
              {form.formState.errors.companyInfo?.companyName && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.companyInfo.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-lime-700">
                Industry
              </Label>
              <Input
                id="industry"
                type="text"
                {...form.register("companyInfo.industry")}
              />
              {form.formState.errors.companyInfo?.industry && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.companyInfo.industry.message}
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
                {...form.register("companyInfo.targetReduction", {
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.companyInfo?.targetReduction && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.companyInfo.targetReduction.message}
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
                {...form.register("companyInfo.contactPerson")}
              />
              {form.formState.errors.companyInfo?.contactPerson && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.companyInfo.contactPerson.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lime-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register("companyInfo.email")}
              />
              {form.formState.errors.companyInfo?.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.companyInfo.email.message}
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
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6 text-lime-700">
          Recent Signees
        </h2>
        <div className="bg-white rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Target Reduction</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.signees.map((signee, index) => (
                <TableRow key={index}>
                  <TableCell>{signee.companyName}</TableCell>
                  <TableCell>{signee.industry}</TableCell>
                  <TableCell>{signee.reduction} tons</TableCell>
                  <TableCell>
                    {new Date(signee.joinedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
