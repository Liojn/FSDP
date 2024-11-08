import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StrategicGoalManager from "./components/StrategicGoalManager";
import SustainabilityScorecard from "./components/SustainabilityScorecard";

const PlannerPage = () => {
  return (
    <div className="mt-6 rounded-lg shadow-lg p-4">
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">Strategic Goals</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Strategic Goals</h2>
              <p className="text-gray-600 mb-6">
                Set, track, and manage your organization&apos;s sustainability
                goals. Monitor progress and adjust strategies to achieve your
                environmental objectives.
              </p>
              <StrategicGoalManager />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
              <p className="text-gray-600 mb-6">
                Detailed analysis of your sustainability metrics. Track key
                performance indicators and identify areas for improvement.
              </p>
              <SustainabilityScorecard />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlannerPage;
