"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  console.log(email);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // For loading state
  const reset = "";
  const router = useRouter();

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(reset);
    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);
    
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", email);
      setMessage("Sign in successful!");
      console.log("Token:", data.token);

      const userId = await fetchUserId();
      console.log(userId);
      localStorage.setItem("userId", userId);

      // Redirect to a protected page, e.g., dashboard
      router.push("/dashboards");
    } else {
      setMessage(data.message);
    }
  };

  const fetchUserId = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        throw new Error("No email found in local storage.");
      }
      const res = await fetch(`/api/company/${encodeURIComponent(email)}`, {
        method: "GET",
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        return data[0]?._id; // Assuming API returns array with `user_id`
      } else {
        throw new Error(data.error || "Failed to fetch user ID");
      }
    } catch (err) {
      console.error("Error fetching user ID:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/landing-background.png')" }}
    >
      <Card className="w-full max-w-sm bg-white backdrop-blur-lg rounded-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-green-800">Login</h1>
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
                <Label htmlFor="email" className="text-green-800">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading} // Disable button when loading
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="mt-4 text-sm text-gray-600 text-center">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-blue-500">
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
