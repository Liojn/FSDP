"use client";
import React, { useState } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, ShoppingCart, Gift, TreePine, Sun, LeafIcon } from "lucide-react";

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
  const [carbonCredits, setCarbonCredits] = useState(1000);
  const [selectedItems, setSelectedItems] = useState<StoreItem[]>([]);

  const storeItems: StoreItem[] = [
    { 
      id: 1, 
      name: "Tree Planting Kit", 
      shortDescription: "Support Local Reforestation", 
      fullDescription: "Our Tree Planting Kit enables you to directly contribute to local ecosystem restoration. Each kit supports the planting of 10 native trees in your community, helping to combat climate change, restore habitats, and improve air quality.",
      cost: 200, 
      impact: "Offset approximately 200 kg of CO2 annually",
      icon: <TreePine className="text-lime-600" /> 
    },
    { 
      id: 2, 
      name: "Solar Panel Contribution", 
      shortDescription: "Renewable Energy Infrastructure", 
      fullDescription: "By purchasing this contribution, you're helping fund solar panel installations in underserved communities. Your support directly supports the transition to clean, renewable energy and helps reduce carbon emissions from traditional power sources.",
      cost: 500, 
      impact: "Generate 500 kWh of clean energy",
      icon: <Sun className="text-lime-600" /> 
    },
    { 
      id: 3, 
      name: "Renewable Energy Offset", 
      shortDescription: "Carbon Emission Reduction", 
      fullDescription: "This offset supports verified renewable energy projects that directly reduce carbon emissions. Your contribution funds wind, solar, and hydroelectric initiatives that replace fossil fuel-based energy production.",
      cost: 300, 
      impact: "Neutralize 1 ton of carbon emissions",
      icon: <LeafIcon className="text-lime-600" /> 
    }
  ];

  const handlePurchase = (item: StoreItem) => {
    if (carbonCredits >= item.cost) {
      setCarbonCredits(carbonCredits - item.cost);
      setSelectedItems([...selectedItems, item]);
    } else {
      alert("Insufficient carbon credits!");
    }
  };

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
                  {selectedItems.length} Items
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Coins className="text-lime-600 w-10 h-10" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-lime-800">
                  {selectedItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()} Credits
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
                <button 
                  onClick={() => handlePurchase(item)}
                  className="bg-lime-500 text-white px-4 py-2 rounded-md hover:bg-lime-600 transition-colors"
                >
                  Purchase
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StorePage;