"use client"

import React, { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const reset = '';
    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(reset);

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage('Sign in successful!');
            console.log('Token:', data.token);
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Sign In</h1>
          {message && <p className="text-red-500 mb-4">{message}</p>} {/* Display message */}
          <form onSubmit={handleSubmission} className="w-full max-w-sm">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              Sign In
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            Don't have an account? <a href="/signup" className="text-blue-500">Sign Up</a>
          </p>
        </div>
    );
}