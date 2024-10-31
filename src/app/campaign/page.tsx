"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
    const fetchCampaignData = async () => {
      try {
        const response = await fetch("/api/campaign");
        if (!response.ok) {
          throw new Error("Failed to fetch campaign data");
        }
        const data = await response.json();
        setCampaignData(data);
      } catch (error) {
        let errorMessage = "An unexpected error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
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

      setCampaignData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          totalReduction: prevData.totalReduction + newSignee.reduction,
          signees: [newSignee, ...prevData.signees], // Add new signee at the top
        };
      });

      form.reset();
      toast({
        title: "Success",
        description: "Successfully joined the campaign!",
        className: "bg-green-100 border-green-200",
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
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
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium mb-1 text-lime-700"
              >
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                className="w-full p-2 border rounded "
                {...form.register("companyInfo.companyName")}
              />
              {form.formState.errors.companyInfo?.companyName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.companyInfo.companyName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium mb-1 text-lime-700"
              >
                Industry
              </label>
              <input
                id="industry"
                type="text"
                className="w-full p-2 border rounded "
                {...form.register("companyInfo.industry")}
              />
              {form.formState.errors.companyInfo?.industry && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.companyInfo.industry.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="targetReduction"
                className="block text-sm font-medium mb-1 text-lime-700"
              >
                Target Reduction (tons)
              </label>
              <input
                id="targetReduction"
                type="number"
                className="w-full p-2 border rounded "
                min="1"
                {...form.register("companyInfo.targetReduction", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = e.target.value;
                    form.setValue(
                      "companyInfo.targetReduction",
                      value === "" ? 0 : Number(value)
                    );
                  },
                })}
              />
              {form.formState.errors.companyInfo?.targetReduction && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.companyInfo.targetReduction.message}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label
                htmlFor="contactPerson"
                className="block text-sm font-medium mb-1 text-lime-700"
              >
                Contact Person
              </label>
              <input
                id="contactPerson"
                type="text"
                className="w-full p-2 border rounded "
                {...form.register("companyInfo.contactPerson")}
              />
              {form.formState.errors.companyInfo?.contactPerson && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.companyInfo.contactPerson.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-lime-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 border rounded "
                {...form.register("companyInfo.email")}
              />
              {form.formState.errors.companyInfo?.email && (
                <p className="text-red-500 text-sm mt-1">
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
