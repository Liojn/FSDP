"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
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

    try {
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
        console.log("User Id: " , userId);
        localStorage.setItem("userId", userId || "");

        // Redirect to a protected page, e.g., dashboard
        router.push("/dashboards");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setLoading(false);
      setMessage("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
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
    console.log("In page.tsx fetchUserId: ", data);

    if (res.ok) {
      return data._id; // Access _id directly from the response object
    } else {
      throw new Error(data.error || "Failed to fetch user ID");
    }
  } catch (err) {
    console.error("Error fetching user ID:", err);
    return "";
  }
};

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={handleSubmission}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-balance text-muted-foreground">
                      Login to your EcoVolt account
                    </p>
                  </div>
                  {message && (
                    <Alert
                      variant={
                        message === "Sign in successful!"
                          ? "default"
                          : "destructive"
                      }
                      className="mt-4"
                    >
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="johndoe@gmail.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="text-center text-sm pt-6">
                    Don&apos;t have an account?{" "}
                    <a href="/signup" className="underline underline-offset-4 ">
                      Sign up
                    </a>
                  </div>
                </div>
              </form>
              <div className="relative hidden bg-muted md:block">
                <Image
                  src="/landing-background.png"
                  width={500}
                  height={600}
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our Terms of Service and Privacy
            Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
