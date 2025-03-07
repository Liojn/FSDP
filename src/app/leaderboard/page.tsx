
// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { TimeFilterType, DataFilterType, LeaderboardData, LeaderboardResponse } from "@/types/leaderboard";

// const LeaderboardPage = () => {
//   const [timeFilter, setTimeFilter] = useState<TimeFilterType>("Today");
//   const [dataFilter, setDataFilter] = useState<DataFilterType>("Carbon Emissions");
//   const [isAtBottom, setIsAtBottom] = useState(false);
//   const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const listRef = useRef<HTMLDivElement>(null);

//   const fetchLeaderboardData = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/leaderboard?timeFilter=${timeFilter}`);
//       const result: LeaderboardResponse = await response.json();
      
//       if (result.status === "error" || !result.data) {
//         throw new Error(result.message || "Failed to fetch leaderboard data");
//       }

//       // Sort based on selected filter
//       const sortedData = [...result.data].sort((a, b) => {
//         if (dataFilter === "Carbon Emissions") {
//           return b.carbonScore - a.carbonScore;
//         } else {
//           return b.energyScore - a.energyScore;
//         }
//       });

//       setLeaderboardData(sortedData);
//       setError(null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeaderboardData();
//   }, [timeFilter, dataFilter]);

//   const handleTimeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setTimeFilter(event.target.value as TimeFilterType);
//   };

//   const handleDataFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setDataFilter(event.target.value as DataFilterType);
//   };

//   const handleScroll = () => {
//     if (!listRef.current) return;
//     const element = listRef.current;
//     const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight;
//     setIsAtBottom(isBottom);
//   };

//   useEffect(() => {
//     const element = listRef.current;
//     if (element) {
//       element.addEventListener("scroll", handleScroll);
//       return () => element.removeEventListener("scroll", handleScroll);
//     }
//   }, []);

//   if (error) {
//     return (
//       <div className="p-4 text-red-600">
//         Error loading leaderboard: {error}
//       </div>
//     );
//   }

//   const getDisplayScore = (company: LeaderboardData) => {
//     if (dataFilter === "Carbon Emissions") {
//       return {
//         score: company.carbonScore,
//         total: company.totalEmissions,
//         unit: "kg CO₂e"
//       };
//     } else {
//       return {
//         score: company.energyScore,
//         total: company.totalEnergy,
//         unit: "kWh"
//       };
//     }
//   };

//   const topThree = leaderboardData.slice(0, 3);
//   const otherCompanies = leaderboardData.slice(3);

//   return (
//     <div className="p-4 h-screen flex flex-col space-y-6">
//       {/* Header Section */}
//       <div className="flex justify-between items-center">
//         <div className="flex items-center space-x-2">
//           <h2 className="text-2xl font-bold text-lime-900">Leaderboard for</h2>
//           <select
//             value={timeFilter}
//             onChange={handleTimeFilterChange}
//             className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
//           >
//             <option value="Today">Today</option>
//             <option value="Yesterday">Yesterday</option>
//             <option value="Last 7 Days">Last 7 Days</option>
//             <option value="Last Month">Last Month</option>
//           </select>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className="font-semibold text-lime-700">Data:</span>
//           <select
//             value={dataFilter}
//             onChange={handleDataFilterChange}
//             className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
//           >
//             <option value="Carbon Emissions">Carbon Emissions</option>
//             <option value="Energy Consumption">Energy Consumption</option>
//           </select>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-900" />
//         </div>
//       ) : (
//         <>
//           {/* Top 3 Section */}
//           <div className="grid grid-cols-3 gap-4 items-end">
//             {[
//               { position: 1, size: "h-64", bgColor: "bg-lime-400" },
//               { position: 0, size: "h-48", bgColor: "bg-lime-300" },
//               { position: 2, size: "h-32", bgColor: "bg-lime-200" },
//             ].map((item) => {
//               const company = topThree[item.position];
//               const metrics = company ? getDisplayScore(company) : null;
              
//               return (
//                 <div key={item.position} className="flex flex-col items-center">
//                   <span className="font-semibold text-lime-900 mb-2">
//                     Top {item.position + 1}
//                   </span>
//                   <div className={`${item.bgColor} ${item.size} w-full rounded-lg flex flex-col justify-center items-center p-4`}>
//                     {company ? (
//                       <>
//                         <span className="font-bold text-lg">{company.name}</span>
//                         <span className="text-2xl font-bold mt-2">{metrics?.score}%</span>
//                         <span className="text-sm mt-1">
//                           {metrics?.total.toLocaleString()} {metrics?.unit}
//                         </span>
//                       </>
//                     ) : (
//                       <span>No data</span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Other Companies Section */}
//           <h3 className="text-lg font-semibold text-lime-700 mt-6">Other companies</h3>
//           <div
//             ref={listRef}
//             className="p-4 rounded-lg flex-grow relative"
//             style={{ maxHeight: "600px", overflowY: "scroll", scrollbarWidth: "none" }}
//           >
//             <ul className="space-y-4">
//               {otherCompanies.map((company, index) => {
//                 const metrics = getDisplayScore(company);
//                 return (
//                   <li
//                     key={index}
//                     className="bg-white p-4 rounded-lg flex justify-between items-center border border-lime-400"
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-lime-300 rounded-full flex items-center justify-center font-bold text-lime-700">
//                         {index + 4}
//                       </div>
//                       <span className="font-medium text-lime-700">{company.name}</span>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-lime-900 font-bold">{metrics.score}%</div>
//                       <div className="text-sm text-lime-600">
//                         {metrics.total.toLocaleString()} {metrics.unit}
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>

//             {/* Fade Effect at Bottom */}
//             {!isAtBottom && (
//               <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
//             )}

//             {/* Scroll Down Indicator */}
//             {!isAtBottom && (
//               <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-lime-700 animate-bounce">
//                 ↓ Scroll down
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default LeaderboardPage;

"use client"; // treat this component as a Client Component


import { PageHeader } from "@/components/shared/page-header";
import React, { useState, useEffect, useRef } from "react";
import { ChangeEvent } from "react";

// Define interfaces for data types
interface LeaderboardEntry {
  name: string;
  score: number;
}

// Type the leaderboard data
const leaderboardData: LeaderboardEntry[] = [
  { name: "EarthWise", score: 60 },
  { name: "NatureNet", score: 58 },
  { name: "PlanetRoots", score: 55 },
  { name: "EnviroTrust", score: 53 },
  { name: "EcoLogic", score: 50 },
  { name: "GreenLeaf", score: 48 },
];

// Define types for filter options
type FilterOption = "Today" | "This Week" | "This Month" | "This Year";
type DataFilterOption =
  | "Energy Consumption"
  | "Carbon Emissions"
  | "Water Usage";

const LeaderboardPage = () => {
  const [filter, setFilter] = useState<FilterOption>("Today");
  const [dataFilter, setDataFilter] =
    useState<DataFilterOption>("Energy Consumption");
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setFilter(event.target.value as FilterOption);

  const handleDataFilterChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setDataFilter(event.target.value as DataFilterOption);

  // Check if the user has scrolled to the bottom
  const handleScroll = () => {
    const element = listRef.current;
    if (element) {
      const isBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight;
      setIsAtBottom(isBottom);
    }
  };

  useEffect(() => {
    const element = listRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="p-4 h-screen flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <PageHeader title="Leaderboard for" className="text-lime-900" />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lime-700">Data:</span>
          <select
            value={dataFilter}
            onChange={handleDataFilterChange}
            className="bg-white border border-lime-500 rounded-md p-2 text-lime-700"
          >
            <option value="Carbon Emissions">Carbon Emissions</option>
            <option value="Energy Consumption">Energy Consumption</option>
          </select>
        </div>
      </div>

      {/* Top 3 Section */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {[
          { title: "Top 2", size: "h-48", bgColor: "bg-lime-300" },
          { title: "Top 1", size: "h-64", bgColor: "bg-lime-400" },
          { title: "Top 3", size: "h-32", bgColor: "bg-lime-200" },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="font-semibold text-lime-900 mb-2">
              {item.title}
            </span>
            <div
              className={`${item.bgColor} ${item.size} w-full rounded-lg flex justify-center items-center`}
            >
              {item.title}
            </div>
          </div>
        ))}
      </div>

      {/* Other Companies Section */}
      <h3 className="text-lg font-semibold text-lime-700 mt-6">
        Other companies
      </h3>
      <div
        ref={listRef}
        className="p-4 rounded-lg flex-grow relative"
        style={{
          maxHeight: "600px",
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
      >
        <ul className="space-y-4">
          {leaderboardData.map((company, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg flex justify-between items-center border border-lime-400"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lime-300 rounded-full"></div>
                <span className="font-medium text-lime-700">
                  {company.name}
                </span>
              </div>
              <span className="text-lime-900">Score: {company.score}%</span>
            </li>
          ))}
        </ul>

        {/* Fade Effect at Bottom */}
        {!isAtBottom && (
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}

        {/* Scroll Down Indicator */}
        {!isAtBottom && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-lime-700 animate-bounce">
            ↓ Scroll down
          </div>
        )}
      </div>
    </div>
  );
};
export default LeaderboardPage;