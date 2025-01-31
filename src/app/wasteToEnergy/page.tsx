'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WasteData {
  id: string;
  company_id: string;
  shipment_id: string;
  weight_tons: number;
  status: string;
  date_sent: string;
  tracking_id: string;
  energy_generated_kwh: number;
  rate_cents_per_kwh: number;
  total_energy_value_sgd: number;
  compensation_sgd: number;
}

interface FormData {
  tracking_id: string;
  weight_tons: string;
}

const WasteTrackingPage = () => {
  // Existing states
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tracking_id: '',
    weight_tons: ''
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Terms and Conditions states
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setFormError("Please accept the Terms and Conditions before submitting");
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
        body: JSON.stringify({
          tracking_id: formData.tracking_id,
          weight_tons: Number(formData.weight_tons)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setFormSuccess(true);
      setFormData({ tracking_id: '', weight_tons: '' });
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

  return (
    <div className="p-7 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Waste-to-Energy Operation</h1>
      
      {/* Terms and Conditions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowTerms(true)}
          >
            View Terms and Conditions
          </Button>
          
          {termsAccepted && (
            <Alert className="mt-4 bg-green-50">
              <AlertDescription>
                Terms and Conditions accepted
              </AlertDescription>
            </Alert>
          )}

          {/* Simple Modal for Terms */}
          {showTerms && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
              <div className="bg-white rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Waste-to-Energy Collaboration Agreement</h2>
                <div className="space-y-4">
                  <h3 className="font-semibold">1. Revenue Distribution Agreement</h3>
                  <p className="ml-4">1.1. The parties hereby agree to a 30-70 revenue distribution model for all energy generated through the waste-to-energy process.</p>
                  <p className="ml-4">1.2. The Facility Operator shall retain 70% of the generated value to cover operational costs, technological investments, and processing expenses.</p>
                  <p className="ml-4">1.3. The partnering organisation shall receive 30% of the total energy value generated as compensation for the provided waste materials.</p>

                  <h3 className="font-semibold">2. Compensation Structure</h3>
                  <p className="ml-4">2.1. Compensation rates will be determined based on prevailing Singapore energy market values.</p>
                  <p className="ml-4">2.2. Market rates shall be reviewed and adjusted quarterly to ensure alignment with current market conditions.</p>
                  <p className="ml-4">2.3. All compensation calculations will be made in Singapore Dollars (SGD).</p>

                  <h3 className="font-semibold">3. Operational Responsibilities</h3>
                  <p className="ml-4">3.1. The Facility Operator shall bear all processing costs, including but not limited to:</p>
                  <p className="ml-8">a) Waste processing and conversion</p>
                  <p className="ml-8">b) Facility maintenance and operations</p>
                  <p className="ml-8">c) Environmental compliance measures</p>
                  <p className="ml-8">d) Technical staff and operational personnel</p>

                  <h3 className="font-semibold">4. Market Rate Adjustments</h3>
                  <p className="ml-4">4.1. Compensation rates are subject to periodic adjustments based on:</p>
                  <p className="ml-8">a) Singapore electricity market fluctuations</p>
                  <p className="ml-8">b) Energy demand variations</p>
                  <p className="ml-8">c) Operational cost changes</p>

                  <div className="mt-6 flex justify-end gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTerms(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        setTermsAccepted(true);
                        setShowTerms(false);
                      }}
                    >
                      Accept Terms
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your existing Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Waste Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Your existing Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Waste Records</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <th className="p-2 text-left">Tracking ID</th>
                    <th className="p-2 text-left">Shipment ID</th>
                    <th className="p-2 text-left">Weight (tons)</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Date Sent</th>
                    <th className="p-2 text-left">Energy (kWh)</th>
                    <th className="p-2 text-left">Rate (¢/kWh)</th>
                    <th className="p-2 text-left">Value (SGD)</th>
                    <th className="p-2 text-left">Compensation (SGD)</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{item.tracking_id}</td>
                      <td className="p-2">{item.shipment_id}</td>
                      <td className="p-2">{item.weight_tons}</td>
                      <td className="p-2">{item.status}</td>
                      <td className="p-2">{formatDate(item.date_sent)}</td>
                      <td className="p-2">{item.energy_generated_kwh?.toLocaleString() ?? '-'}</td>
                      <td className="p-2">{item.rate_cents_per_kwh ?? '-'}</td>
                      <td className="p-2">{item.total_energy_value_sgd?.toLocaleString() ?? '-'}</td>
                      <td className="p-2">{item.compensation_sgd?.toLocaleString() ?? '-'}</td>
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
    </div>
  );
};

export default WasteTrackingPage;