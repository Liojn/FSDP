'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Gauge, PieChart, Battery } from 'lucide-react';

interface WasteData {
  id: string;
  company_id: string;
  shipment_id: string;
  weight_tons: number;
  status: string;
  date_sent: string;
  tracking_id: string;
  energy_generated_kwh?: number;
  rate_cents_per_kwh: number;
  total_energy_value_sgd: number;
  compensation_sgd: number;
  waste_category: string[];
  carbon_credits?: number;
  weight_accepted?: number;
}

interface DashboardMetrics {
  totalWaste: number;
  totalEnergy: number;
  totalCarbonCredits: number;
  wasteAcceptanceRate: number;
}

interface FormData {
  tracking_id: string;
  weight_tons: string;
  waste_category: string[];
  transport_mode: string;
}

const WASTE_CATEGORIES = [
  { id: "organic", label: "Organic Crop Residues" },
  { id: "process", label: "Process Waste" },
  { id: "animal", label: "Animal Waste (Dried)" }
];

const WasteTrackingPage = () => {
  // States
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tracking_id: '',
    weight_tons: '',
    waste_category: [],
    transport_mode: ''
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
    // New state for view management
  const [currentView, setCurrentView] = useState<'table' | 'form'>('table');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) {  // Minimum swipe distance
      if (diff > 0 && currentView === 'table') {
        setCurrentView('form');
      } else if (diff < 0 && currentView === 'form') {
        setCurrentView('table');
      }
      setTouchStart(null);
    }
  };

  // Dashboard metrics state
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalWaste: 0,
    totalEnergy: 0,
    totalCarbonCredits: 0,
    wasteAcceptanceRate: 0
  });

  // Calculate dashboard metrics
  const calculateMetrics = (data: WasteData[]) => {
    // Filter out in-progress records
    const completedRecords = data.filter(item => item.status !== "In Progress");
    
    const metrics = {
      totalWaste: data.reduce((sum, item) => sum + item.weight_tons, 0),
      totalEnergy: data.reduce((sum, item) => sum + (item.energy_generated_kwh || 0), 0),
      totalCarbonCredits: data.reduce((sum, item) => sum + (item.carbon_credits || 0), 0),
      wasteAcceptanceRate: calculateAcceptanceRate(completedRecords)
    };
    setMetrics(metrics);
  };

  // Helper function to calculate acceptance rate
  const calculateAcceptanceRate = (completedRecords: WasteData[]) => {
    if (completedRecords.length === 0) return 0;

    const totalWeightSent = completedRecords.reduce((sum, item) => sum + item.weight_tons, 0);
    const totalWeightAccepted = completedRecords.reduce((sum, item) => sum + (item.weight_accepted || 0), 0);

    return (totalWeightAccepted / totalWeightSent) * 100;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => {
      const categories = prev.waste_category.includes(categoryId)
        ? prev.waste_category.filter(id => id !== categoryId)
        : [...prev.waste_category, categoryId];
      return { ...prev, waste_category: categories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setFormError("Please accept the Terms and Conditions before submitting");
      return;
    }
    if (formData.waste_category.length === 0) {
      setFormError("Please select at least one waste category");
      return;
    }
    setFormError(null);
    setFormSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/WTEForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userName': 'nicole'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setFormSuccess(true);
      setFormData({
        tracking_id: '',
        weight_tons: '',
        waste_category: [],
        transport_mode: ''
      });
      fetchWasteData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormSuccess(false), 3000);
    }
  };

  const fetchWasteData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/wasteToEnergy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userName': 'nicole'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setWasteData(data.wteData);
      calculateMetrics(data.wteData);
    } catch (err) {
      const errorMessage = err instanceof Error ? 
        `Error: ${err.message}` : 
        'Failed to fetch waste data';
      setError(errorMessage);
      console.error('Error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dashboard component
  const Dashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Waste Acceptance Rate"
        value={`${metrics.wasteAcceptanceRate.toFixed(1)}%`}
        icon={<PieChart className="h-6 w-6" />}
      />
      <MetricCard
        title="Total Energy Generated"
        value={`${(metrics.totalEnergy / 1000).toFixed(2)} MWh`}
        icon={<Gauge className="h-6 w-6" />}
      />
      <MetricCard
        title="Total AgriTech Credits Earned"
        value={`${metrics.totalCarbonCredits.toFixed(0)}`}
        icon={<Battery className="h-6 w-6" />}
      />
    </div>
  );

  // Metric card component
  const MetricCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="text-blue-500">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
    // Navigation component
  const ViewToggle = () => (
    <div className="flex justify-center items-center space-x-4 mb-6">
      <Button 
        variant={currentView === 'table' ? "default" : "outline"}
        onClick={() => setCurrentView('table')}
        className="flex items-center"
      >
        Data Table
      </Button>
      <Button 
        variant={currentView === 'form' ? "default" : "outline"}
        onClick={() => setCurrentView('form')}
        className="flex items-center"
      >
        New Shipment Form
      </Button>
    </div>
  );

  return (
    <div 
      className="p-7 space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <h1 className="text-2xl font-bold mb-6">Waste-to-Energy Operation</h1>
      
      <Dashboard />

      <ViewToggle />
      <div className="transition-transform duration-300 ease-in-out">
        {currentView === 'table' ? (
          <Card>
            <CardHeader>
              <CardTitle>Waste Records</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Your existing table content */}
              {isLoading ? (
                <div className="text-center py-4">Loading waste data...</div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : wasteData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Date Sent</th>
                        <th className="p-2 text-left">Shipment ID</th>
                        <th className="p-2 text-left">Tracking ID</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Weight Recorded</th>
                        <th className="p-2 text-left">Weight Accepted</th>
                        <th className="p-2 text-left">Carbon Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wasteData.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{new Date(item.date_sent).toLocaleDateString()}</td>
                          <td className="p-2">{item.shipment_id}</td>
                          <td className="p-2">{item.tracking_id}</td>
                          <td className="p-2">{item.waste_category.join(", ")}</td>
                          <td className="p-2">{item.status}</td>
                          <td className="p-2">{item.weight_tons.toLocaleString()}</td>
                          <td className="p-2">{item.weight_accepted?.toLocaleString()}</td>
                          <td className="p-2">{item.carbon_credits?.toLocaleString() ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">No waste tracking data available</div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Waste Record</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Your existing form content */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tracking_id" className="block text-sm font-medium mb-1">
                      Tracking ID
                    </label>
                    <Input
                      id="tracking_id"
                      name="tracking_id"
                      value={formData.tracking_id}
                      onChange={handleInputChange}
                      placeholder="Enter tracking ID"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight_tons" className="block text-sm font-medium mb-1">
                      Weight (tons)
                    </label>
                    <Input
                      id="weight_tons"
                      name="weight_tons"
                      type="number"
                      step="0.01"
                      value={formData.weight_tons}
                      onChange={handleInputChange}
                      placeholder="Enter weight in tons"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-1">
                    Waste Categories
                  </label>
                  {WASTE_CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={formData.waste_category.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="transport_mode" className="block text-sm font-medium mb-1">
                    Transport Mode
                  </label>
                  <select
                    id="transport_mode"
                    name="transport_mode"
                    value={formData.transport_mode}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select transport mode</option>
                    <option value="sea">Sea</option>
                    <option value="air">Air</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold">Terms and Conditions</h3>
                  <div className="text-sm space-y-2">
                    <p>1. Revenue Distribution:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Carbon credits will be awarded based on energy generated (1 credit per 100kWh)</li>
                      <li>Only accepted waste will be eligible for AgriTech credits</li>
                    </ul>
                    <p>2. Operational Guidelines:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>All waste must meet specified category requirements</li>
                      <li>All data must be accurately declared</li>
                      <li>Waste weight will be verified upon arrival</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none"
                  >
                    I accept the terms and conditions
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>

              {formSuccess && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Waste record submitted successfully!
                  </AlertDescription>
                </Alert>
              )}

              {formError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WasteTrackingPage;

