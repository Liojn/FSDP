"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Account() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mainGoals, setMainGoals] = useState('');
    const [message, setMessage] = useState('');
    const [logoutMessage, setLogoutMessage] = useState(false);
    const router = useRouter();

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
        setLogoutMessage(false);

        if (!name || !email || !password) {
            setMessage('All profile fields must be filled');
            return;
        }
        
        const currentEmail = localStorage.getItem('userEmail'); // Retrieve the current email

        try {
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, currentEmail }),
            });

            const data = await response.json();
            if (response.ok) {
                // Update local storage with the new name and email
                localStorage.setItem('userName', name);
                localStorage.setItem('userEmail', email);
                setMessage('Profile updated successfully!');
                setLogoutMessage(true);

                // Wait for 3 seconds, clear storage, and redirect
                setTimeout(() => {
                    localStorage.clear();
                    router.push('/login');
                }, 3000);
            } else {
                setMessage(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            setMessage('An error occurred while updating the profile.');
        }
    };

    const handleGoalsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const userId = localStorage.getItem('userId'); // Use the stored _id

        // Ensure the mainGoals is a valid number (float)
        const parsedMainGoals = parseFloat(mainGoals);

        if (isNaN(parsedMainGoals)) {
        setMessage('Please enter a valid number for the main goal');
        return;
        }

        try {
            const response = await fetch('/api/update-goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mainGoals: parsedMainGoals, userId }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Goals updated successfully!');
                router.refresh(); // Refresh the page to show updated goals
            } else {
                setMessage(data.message || 'Failed to update goals');
            }
        } catch (error) {
            console.error(error);
            setMessage('An error occurred while updating the goals.');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Account</h1>

            {message && <p className={`mb-4 ${logoutMessage ? 'text-blue-500' : 'text-green-500'}`}>{message}</p>}
            {logoutMessage && (
                <p className="mb-4 text-blue-500">
                    Profile updated. You will be logged out shortly to reset your session.
                </p>
            )}

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
                        step="0.01" // Increment by 0.01
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