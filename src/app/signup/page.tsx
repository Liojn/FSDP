"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Ensure this path is correct

export default function SignUp({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstYearGoal, setFirstYearGoal] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // For loading state
  const router = useRouter();
  const reset = "";

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(reset);
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, firstYearGoal }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setMessage("Sign up successful!");

        setName(reset);
        setEmail(reset);
        setPassword(reset);
        setFirstYearGoal(reset);
        // Optionally, you can display a success message before redirecting
        router.push("/login");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setLoading(false);
      setMessage("An unexpected error occurred. Please try again.");
      console.error("SignUp error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-5xl">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form
                className="p-6 md:p-12 md:col-span-1"
                onSubmit={handleSubmission}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-3xl font-bold">
                      Get Started with EcoVolt
                    </h1>
                    <p className="text-balance text-muted-foreground">
                      Create your EcoVolt account
                    </p>
                  </div>
                  {message && (
                    <Alert
                      variant={
                        message === "Sign up successful!"
                          ? "default"
                          : "destructive"
                      }
                      className="mt-4"
                    >
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="name">Company Name</Label>
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

                  <div className="grid gap-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@gmail.com"
                      required
                      className="placeholder-green-400"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
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

                  <div className="grid gap-2">
                    <Label htmlFor="firstYearGoal">First Year Goal</Label>
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
                    {loading ? "Signing up..." : "Sign Up"}
                  </Button>

                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="text-blue-500 underline underline-offset-4"
                    >
                      Login
                    </a>
                  </p>
                </div>
              </form>
              <div className="relative hidden bg-muted md:block md:col-span-1">
                <Image
                  src="/landing-background.png"
                  width={800} // Increased width for better visibility
                  height={900} // Increased height for better visibility
                  alt="Sign Up Illustration"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
