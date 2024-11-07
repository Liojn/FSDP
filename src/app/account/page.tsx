"use client";

import React, { useState, useEffect } from 'react';

export default function Account() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mainGoals, setMainGoals] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Load the locally saved name and email when the component mounts
        const storedName = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!name || !email || !password) {
            setMessage('All profile fields must be filled');
            return;
        }
        
        const response = await fetch('/api/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Update local storage with the new name and email
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            setMessage('Profile updated successfully!');
            window.location.reload();
        } else {
            setMessage(data.message || 'Failed to update profile');
        }
    };

    const handleGoalsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!mainGoals) {
            setMessage('The main goals field must be filled');
            return;
        }

        const response = await fetch('/api/update-goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mainGoals }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage('Goals updated successfully!');
        } else {
            setMessage(data.message || 'Failed to update goals');
        }
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
                    <label htmlFor="mainGoals" className="block text-sm font-medium">
                        Overall Carbon Emissions Goal (CO<sub>2</sub>e)
                    </label>
                    <input
                        id="mainGoals"
                        type="number"
                        min="0"
                        value={mainGoals}
                        onChange={(e) => setMainGoals(e.target.value)}
                        placeholder="Enter goal in CO2e"
                        className="border border-gray-300 rounded p-2 w-full text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Update Goals
                </button>
                </form>
            </section>
        </div>
    );
}