"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Ensure this path is correct

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstYearGoal, setFirstYearGoal] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // For loading state
    const router = useRouter();
    const reset = '';

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(reset);
        setLoading(true);

        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, firstYearGoal }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
            setMessage(data.message);

            setName(reset);
            setEmail(reset);
            setPassword(reset);
            setFirstYearGoal(reset);
            router.push('/login');
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/landing-background.png')" }}
        >
          <Card className="w-full max-w-sm bg-white/40 backdrop-blur-lg rounded-lg">
            <CardHeader>
              <h1 className="text-2xl font-bold text-center text-green-800">Sign Up</h1>
              {message && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmission}>
                <div className="space-y-4">
                  <div className="">
                    <Label htmlFor="name" className="text-green-800">Company Name</Label>
                    <Input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter company name"
                      required
                      className="placeholder-green-400"
                    />
                  </div>

                  <div className="">
                    <Label htmlFor="email" className="text-green-800">Company Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter company email"
                      required
                      className="placeholder-green-400"
                    />
                  </div>

                  <div className="">
                    <Label htmlFor="password" className="text-green-800">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="placeholder-green-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="firstYearGoal" className="text-green-800">First Year Goal</Label>
                    <Input
                      type="number"
                      id="firstYearGoal"
                      value={firstYearGoal}
                      onChange={(e) => setFirstYearGoal(e.target.value)}
                      placeholder="Enter first year goal"
                      required
                      className="placeholder-green-400"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading} // Disable button when loading
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                  <p className="mt-4 text-sm text-gray-600 text-center">
                      Already have an account?{" "}
                      <a href="/login" className="text-blue-500">
                        Login
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
 
        </div>
      );
}
