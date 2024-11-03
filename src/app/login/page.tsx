"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const reset = "";
  const router = useRouter();

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(reset);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", email);
      setMessage("Sign in successful!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Login</h1>
          {message && <p className="text-red-500">{message}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmission}>
            <div className="space-y-4">
              <div className="">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                Login
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
