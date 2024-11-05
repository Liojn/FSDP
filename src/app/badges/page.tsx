"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Console } from "console";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const categories = ["ALL", "Energy", "Waste", "Carbon", "Equipment", "Crop", "Livestock"];

  // Fetch the user_id using email from local storage
  // const fetchUserId = async () => {
  //   try {
  //     const email = localStorage.getItem("userEmail");
  //     if (!email) {
  //       throw new Error("No email found in local storage.");
  //     }
  //     const res = await fetch(`/api/badges/company/${encodeURIComponent(email)}`, {
  //       method: 'GET',
  //     });
  //     const data = await res.json();
  //     console.log(data)

  //     if (res.ok) {
  //       return data[0]?.user_id;  // Assuming API returns array with `user_id`
  //     } else {
  //       throw new Error(data.error || "Failed to fetch user ID");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching user ID:", err);
  //     setError(err.message);
  //     setLoading(false);
  //   }
  // };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      console.log(userId)
      if (!userId) return;

      const res = await fetch(`/api/badges/achivements/${userId}`);
      console.log("Hello im here")
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setAchievements(data);
      } else {
        throw new Error(data.error || "Failed to fetch achievements");
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
    console.log("I'm done.")
  }, []);

  const filteredAchievements = achievements.filter(
    (achievement) => filter === "ALL" || achievement.category === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const AchievementCard = ({ achievement }) => (
  <div
    className={`relative p-6 rounded-xl ${
      achievement.isUnlocked
        ? "bg-white border border-lime-400"
        : "bg-gray-50 border border-gray-200"
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-lime-500 flex items-center justify-center">
          <img src="/icon.svg" alt="Achievement Icon" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">
            {achievement.title}
          </h3>
          <p className="text-gray-500 text-sm">
            {achievement.description}
          </p>
        </div>
      </div>
      <div className="text-gray-500 text-sm">
        {achievement.isUnlocked
          ? `Unlocked ${achievement.unlockedDate}`
          : `${achievement.progress}% Complete`}
      </div>
    </div>
    <div className="mt-4">
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 rounded-full ${
            achievement.isUnlocked
              ? "bg-lime-500"
              : `bg-lime-500 w-[${achievement.progress}%]`
          }`}
        />
      </div>
    </div>
  </div>
);

return (
  <div className="p-4 h-screen flex flex-col space-y-6">
    <div className="flex space-x-4">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2 bg-gray-200 rounded-md focus:outline-none"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAchievements.map((achievement) => (
        <AchievementCard key={achievement._id} achievement={achievement} />
      ))}
    </div>
  </div>
);
};

export default AchievementsPage;
