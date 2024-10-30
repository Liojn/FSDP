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
      },
      sustainabilityGoals: {},
      reportingPreferences: {},
    },
  });

  useEffect(() => {
    // Temporarily using fake data instead of fetching
    // const fetchCampaignData = async () => {
    //   try {
    //     const response = await fetch("/api/campaign");
    //     if (!response.ok) {
    //       throw new Error("Failed to fetch campaign data");
    //     }
    //     const data = await response.json();
    //     setCampaignData(data);
    //   } catch (error) {
    //     let errorMessage = "An unexpected error occurred";
    //     if (error instanceof Error) {
    //       errorMessage = error.message;
    //     }
    //     setError(errorMessage);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // Temporary fake campaign data
    const fakeCampaignData: CampaignData = {
      totalReduction: 150,
      signees: [
        {
          companyName: "Eco Innovations",
          industry: "Renewable Energy",
          reduction: 50,
          joinedAt: new Date().toISOString(),
        },
        {
          companyName: "Green Tech Solutions",
          industry: "Technology",
          reduction: 75,
          joinedAt: new Date().toISOString(),
        },
        {
          companyName: "Sustainable Agriculture Co.",
          industry: "Agriculture",
          reduction: 25,
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    setCampaignData(fakeCampaignData);
    setLoading(false);
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
        throw new Error("Failed to join campaign");
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
          signees: [...prevData.signees, newSignee],
        };
      });

      form.reset();
      toast({
        title: "Success",
        description: "Successfully joined the campaign!",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-red-50 border-red-200",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      <div className="flex items-center justify-center min-h-screen">
        No campaign data available
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Join Our Sustainability Campaign
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Campaign Progress</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Reduction Target</p>
              <p className="text-2xl font-bold">
                {campaignData.totalReduction} tons
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Participants</p>
              <p className="text-2xl font-bold">
                {campaignData.signees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Join the Campaign</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium mb-1"
              >
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                className="w-full p-2 border rounded"
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
                className="block text-sm font-medium mb-1"
              >
                Industry
              </label>
              <input
                id="industry"
                type="text"
                className="w-full p-2 border rounded"
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
                className="block text-sm font-medium mb-1"
              >
                Target Reduction (tons)
              </label>
              <input
                id="targetReduction"
                type="number"
                className="w-full p-2 border rounded"
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

            <Button
              type="submit"
              disabled={!form.formState.isValid || submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Campaign"
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Recent Signees</h2>
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
