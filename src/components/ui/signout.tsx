"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export function SignOut() {
  const router = useRouter();

  const handleSignOut = () => {
    // Clear any saved data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail")
    
    // Redirect to the login page
    router.push("/login");
  };

  return (
    <Button
      className="w-full bg-white text-black hover:bg-gray-200"
      size="lg"
      onClick={handleSignOut} // Trigger sign-out on button click
    >
      Sign Out
    </Button>
  );
}