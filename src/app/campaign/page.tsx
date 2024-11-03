"use client";

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
import { toast } from "@/hooks/use-toast";
import {
  CampaignData,
  CompanyFormValues,
  ParticipationFormValues,
  CompanySize,
  companyFormSchema,
  participationFormSchema,
} from "./types";
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
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CampaignPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetRange, setTargetRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    mode: "onChange",
  });

  const participationForm = useForm<ParticipationFormValues>({
    resolver: zodResolver(participationFormSchema),
    mode: "onChange",
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

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
        window.location.host
      }/api/campaign/ws`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCampaignData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          campaign: {
            ...prevData.campaign,
            totalReduction: data.totalReduction,
            milestones: data.milestones,
          },
        };
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  // Remove industry code and replace with email auto-fill
  useEffect(() => {
    // Get email from localStorage
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    
    if (userEmail) {
      companyForm.setValue("email", userEmail);
    }
    if (userName) {
      companyForm.setValue("contactPerson", userName);
    }

  }, []); // Empty dependency array since we only want this to run once on mount

  // Update target range when industry and size are selected
  useEffect(() => {
    const industry = companyForm.watch("industry");
    const size = companyForm.watch("size");

    if (industry && size && campaignData?.industryStandards) {
      const industryStandard = campaignData.industryStandards.find(
        (is) => is.industry === industry
      );

      if (industryStandard) {
        const sizeMultipliers: Record<CompanySize, number> = {
          Small: 1,
          Medium: 2,
          Large: 3,
        };
        const multiplier =
          sizeMultipliers[size as CompanySize] * industryStandard.multiplier;
        setTargetRange({
          min: industryStandard.minReduction * multiplier,
          max: industryStandard.maxReduction * multiplier,
        });
      }
    }
  }, [campaignData?.industryStandards, companyForm]);

  const onSubmit = async (
    companyValues: CompanyFormValues,
    participationValues: ParticipationFormValues
  ) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/campaign/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyInfo: companyValues,
          targetReduction: participationValues.targetReduction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to join campaign");
      }

      // Update campaign data with new participant
      setCampaignData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          campaign: {
            ...prevData.campaign,
            totalReduction:
              prevData.campaign.totalReduction +
              participationValues.targetReduction,
            signeesCount: prevData.campaign.signeesCount + 1,
          },
          participants: [
            {
              company: data.company,
              participation: data.participation,
            },
            ...prevData.participants,
          ],
        };
      });

      companyForm.reset();
      participationForm.reset();
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
    (campaignData.campaign.totalReduction /
      campaignData.campaign.targetReduction) *
    100;

  return (
    <div className="container mx-auto px-4 pb-8">
      <PageHeader title={campaignData.campaign.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Campaign Progress Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Campaign Progress
          </h2>

          {/* Progress bar */}
          <div className="space-y-2 mb-4">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600 text-right">
              {progressPercentage.toFixed(1)}%
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Campaign Period</p>
              <p className="text-base">
                {new Date(campaignData.campaign.startDate).toLocaleDateString()}{" "}
                - {new Date(campaignData.campaign.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reduction Achieved</p>
              <p className="text-2xl font-bold text-lime-600">
                {campaignData.campaign.totalReduction.toLocaleString()} tons
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reduction Target</p>
              <p className="text-2xl font-bold text-lime-600">
                {campaignData.campaign.targetReduction.toLocaleString()} tons
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Participants</p>
              <p className="text-2xl font-bold text-lime-600">
                {campaignData.campaign.signeesCount}
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Milestones</h3>
            <div className="space-y-2">
              {campaignData.campaign.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    milestone.reached
                      ? "bg-lime-100 text-lime-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{milestone.percentage}% Target Reached</span>
                    {milestone.reached && (
                      <span className="text-sm">
                        {new Date(milestone.reachedAt!).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Join Form Section */}
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
              <Label htmlFor="industry" className="text-lime-700">
                Industry
              </Label>
              <Select
                onValueChange={(value) =>
                  companyForm.setValue("industry", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {campaignData.industryStandards.map((is) => (
                    <SelectItem key={is.industry} value={is.industry}>
                      {is.industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {companyForm.formState.errors.industry && (
                <p className="text-red-500 text-sm">
                  {companyForm.formState.errors.industry.message}
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
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
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
              <Input
                id="email"
                type="email"
                {...companyForm.register("email")}
              />
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
      </div>

      {/* Participants Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6 text-lime-700">
          Campaign Participants
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Target Reduction</TableHead>
                <TableHead>Current Progress</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignData.participants.map((p, index) => (
                <TableRow key={index}>
                  <TableCell>{p.company.name}</TableCell>
                  <TableCell>{p.company.industry}</TableCell>
                  <TableCell>{p.company.size}</TableCell>
                  <TableCell>
                    {p.participation.targetReduction.toLocaleString()} tons
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={
                          (p.participation.currentProgress /
                            p.participation.targetReduction) *
                          100
                        }
                        className="w-24 h-2"
                      />
                      <span>
                        {p.participation.currentProgress.toLocaleString()} tons
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(p.participation.joinedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
