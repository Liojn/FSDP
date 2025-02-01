"use client";
import React, { useState, useEffect } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Coins, 
  ShoppingCart, 
  Gift, 
  TreePine, 
  Sun, 
  LeafIcon, 
  CheckCircle2,
  XCircle
} from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

// Define types for store items and selected items
interface StoreItem {
  id: number;
  name: string;
  shortDescription: string;
  fullDescription: string;
  cost: number;
  impact: string;
  icon: React.ReactNode;
}

const StorePage: React.FC = () => {
  const [carbonCredits, setCarbonCredits] = useState(0);
  const [selectedItems, setSelectedItems] = useState<StoreItem[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseItem, setPurchaseItem] = useState<StoreItem | null>(null);

  const storeItems: StoreItem[] = [
    { 
      id: 1, 
      name: "Tree Planting Kit", 
      shortDescription: "Support Local Reforestation", 
      fullDescription: "Our Tree Planting Kit enables you to directly contribute to local ecosystem restoration. Each kit supports the planting of 10 native trees in your community, helping to combat climate change, restore habitats, and improve air quality.",
      cost: 1, 
      impact: "Offset approximately 200 kg of CO2 annually",
      icon: <TreePine className="text-lime-600" /> 
    },
    { 
      id: 2, 
      name: "Solar Panel Contribution", 
      shortDescription: "Renewable Energy Infrastructure", 
      fullDescription: "By purchasing this contribution, you're helping fund solar panel installations in underserved communities. Your support directly supports the transition to clean, renewable energy and helps reduce carbon emissions from traditional power sources.",
      cost: 2, 
      impact: "Generate 500 kWh of clean energy",
      icon: <Sun className="text-lime-600" /> 
    },
    { 
      id: 3, 
      name: "Renewable Energy Offset", 
      shortDescription: "Carbon Emission Reduction", 
      fullDescription: "This offset supports verified renewable energy projects that directly reduce carbon emissions. Your contribution funds wind, solar, and hydroelectric initiatives that replace fossil fuel-based energy production.",
      cost: 1, 
      impact: "Neutralize 1 ton of carbon emissions",
      icon: <LeafIcon className="text-lime-600" /> 
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          throw new Error("No user email found");
        }

        const response = await fetch(`/api/company/${userEmail}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setCarbonCredits(userData.carbonCredits || 0);
        setTotalPurchases(userData.totalPurchase || 0);
        setTotalSpent(userData.totalSpent || 0);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to localStorage if fetch fails
        setCarbonCredits(parseInt(localStorage.getItem("storeCurrency") || "0", 10));
        setTotalPurchases(parseInt(localStorage.getItem("totalPurchases") || "0", 10));
        setTotalSpent(parseInt(localStorage.getItem("totalSpent") || "0", 10));
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePurchase = async () => {
    if (!purchaseItem) return;

    if (carbonCredits >= purchaseItem.cost) {
      try {
        const userEmail = localStorage.getItem("userEmail");
        const newCreditBalance = carbonCredits - purchaseItem.cost;
        const newTotalPurchases = totalPurchases + 1;
        const newTotalSpent = totalSpent + purchaseItem.cost;

        // Update backend with new credit balance, total purchases, and total spent
        const response = await fetch(`/api/company/${userEmail}/updateCredits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            carbonCredits: newCreditBalance,
            totalPurchase: newTotalPurchases,
            totalSpent: newTotalSpent
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update credits");
        }

        // Update local state
        setCarbonCredits(newCreditBalance);
        setSelectedItems([...selectedItems, purchaseItem]);
        setTotalPurchases(newTotalPurchases);
        setTotalSpent(newTotalSpent);

        // Update localStorage
        localStorage.setItem("storeCurrency", newCreditBalance.toString());
        localStorage.setItem("totalPurchases", newTotalPurchases.toString());
        localStorage.setItem("totalSpent", newTotalSpent.toString());

        // Reset purchase item
        setPurchaseItem(null);
      } catch (error) {
        console.error("Purchase error:", error);
        alert("Failed to complete purchase. Please try again.");
      }
    } else {
      alert("Insufficient carbon credits!");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <PageHeader title="Carbon Credits Store" />
      
      <Card className="w-full bg-lime-50 border-lime-200 mb-6">
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Coins className="text-lime-600 w-10 h-10" />
              <div>
                <p className="text-sm text-gray-600">Available Credits</p>
                <p className="text-2xl font-bold text-lime-800">
                  {carbonCredits.toLocaleString()} Credits
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ShoppingCart className="text-lime-600 w-10 h-10" />
              <div>
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-lime-800">
                  {totalPurchases} Items
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Gift className="text-lime-600 w-10 h-10" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-lime-800">
                  {totalSpent.toLocaleString()} Credits
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
        {storeItems.map(item => (
          <Card 
            key={item.id} 
            className="border border-lime-400 hover:bg-lime-50 transition-colors flex flex-col"
          >
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-lime-600">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.shortDescription}</p>
                </div>
                {item.icon}
              </div>
              <div className="text-sm text-gray-600 mb-4 flex-grow">
                {item.fullDescription}
              </div>
              <div className="mt-4 bg-lime-100 p-2 rounded-md mb-4">
                <p className="text-xs text-lime-800 font-medium">Environmental Impact</p>
                <p className="text-sm text-lime-700">{item.impact}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-lime-800">
                  {item.cost} Credits
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button 
                      onClick={() => setPurchaseItem(item)}
                      className="bg-lime-500 text-white px-4 py-2 rounded-md hover:bg-lime-600 transition-colors"
                    >
                      Purchase
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to purchase the {item.name}?
                        
                        <div className="mt-4 bg-lime-50 p-3 rounded-md">
                          <div className="flex justify-between mb-2">
                            <span>Item Cost:</span>
                            <span className="font-bold">{item.cost} Credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining Credits:</span>
                            <span className="font-bold">
                              {carbonCredits - item.cost} Credits
                            </span>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setPurchaseItem(null)}>
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handlePurchase}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StorePage;