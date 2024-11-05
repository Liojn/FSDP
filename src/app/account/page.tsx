"use client";

import React, { useState } from 'react';

export default function Account() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mainGoals, setMainGoals] = useState('');
    const [message, setMessage] = useState('');

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const response = await fetch('/api/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        setMessage(response.ok ? 'Profile updated successfully!' : data.message);
    };

    const handleGoalsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const response = await fetch('/api/update-goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mainGoals }),
        });

        const data = await response.json();
        setMessage(response.ok ? 'Goals updated successfully!' : data.message);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Account</h1>

            {message && <p className="mb-4 text-green-500">{message}</p>}

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Update Profile</button>
                </form>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Update Main Goals</h2>
                <form onSubmit={handleGoalsUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="mainGoals" className="block text-sm font-medium">Main Goals</label>
                        <textarea
                            id="mainGoals"
                            value={mainGoals}
                            onChange={(e) => setMainGoals(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full"
                            rows={4}
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Update Goals</button>
                </form>
            </section>
        </div>
    );
}