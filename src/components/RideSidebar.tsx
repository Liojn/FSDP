"use client"

import React from 'react'

export default function RightSidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4 border-l border-gray-200 fixed right-0 top-0 h-full">
      <h2 className="text-xl font-bold mb-4">Right Panel</h2>
      <div className="space-y-4">
        {/* You can populate this section with relevant widgets or links */}
        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-semibold">Notifications</h3>
          <p>No new notifications</p>
        </div>

        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-semibold">Recent Activity</h3>
          <ul className="list-disc list-inside">
            <li>User A completed a task</li>
            <li>User B added a new goal</li>
          </ul>
        </div>

        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-semibold">Quick Links</h3>
          <ul className="list-inside">
            <li><a href="#" className="text-blue-600 hover:underline">Help Center</a></li>
            <li><a href="#" className="text-blue-600 hover:underline">Contact Support</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
