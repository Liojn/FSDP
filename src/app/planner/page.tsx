"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlannerCharts } from "./components/PlannerCharts";
import StrategicGoalManager from "./components/StrategicGoalManager";
import SustainabilityScorecard from "./components/SustainabilityScorecard";
import { PageHeader } from "@/components/shared/page-header";

const PlannerPage = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <PageHeader title="Strategic Sustainability Planner" />
          <p className="text-gray-500 mt-2">
            Set long-term sustainability goals, analyze progress, and make informed strategic decisions based on real-time operational insights.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Strategic Report</Button>
          <Button>Add New Strategic Goal</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Strategic Goals</h3>
          <p className="text-2xl font-bold mt-2">12</p>
          <div className="text-sm text-green-600 mt-2">↑ 2 new this month</div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Overall Long-term Progress</h3>
          <p className="text-2xl font-bold mt-2">76%</p>
          <div className="text-sm text-green-600 mt-2">↑ 5% increase</div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Carbon Reduction</h3>
          <p className="text-2xl font-bold mt-2">28%</p>
          <div className="text-sm text-green-600 mt-2">↑ 3% better than target</div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Goal Completion Rate</h3>
          <p className="text-2xl font-bold mt-2">82%</p>
          <div className="text-sm text-green-600 mt-2">↑ On track</div>
        </Card>
      </div>

      {/* Charts Section */}
      <PlannerCharts />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Strategic Goals Management</h2>
          <StrategicGoalManager />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics and Benchmarks</h2>
          <SustainabilityScorecard />
        </Card>
      </div>
    </div>
  );
};

export default PlannerPage;
