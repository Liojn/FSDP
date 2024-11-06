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
    const [message, setMessage] = useState('');
    const router = useRouter();
    const reset = '';

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(reset);

        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(data.message);

            setName(reset);
            setEmail(reset);
            setPassword(reset);

            
              router.push('/login');
           
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <h1 className="text-2xl font-bold text-center pb-4">Sign Up</h1>
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
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div className="">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter company email"
                      required
                    />
                  </div>

                  <div className="">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Sign Up
                  </Button>
                </div>
              </form>
                       <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account? <a href="/login" className="text-blue-500">Sign In</a>
          </p>
            </CardContent>
          </Card>
 
        </div>
      );
}
