"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

export default function Landing() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Disable scrolling
        document.body.style.overflow = "hidden";

        // Trigger opacity change after 1 second to create a smooth transition
        setTimeout(() => {
            setIsVisible(true);
        }, 100);

        return () => {
            // Re-enable scrolling when the component is unmounted
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleLogin = () => router.push('/login');
    const handleSignup = () => router.push('/signup');

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
            {/* Background image */}
            <img 
                src="/landing-background.png" 
                alt="Background"
                role="img"
                aria-label="Background image for landing page"
                className="absolute top-0 left-0 w-full h-full object-cover -z-10" 
            />

            {/* Main content */}
            <h1
                className={`text-3xl font-bold text-green-700 mb-6 text-center bg-white/50 p-4 rounded-md shadow-lg 
                transition-opacity duration-2000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
                Together, let's make the world a greener place
            </h1>
            {/* Buttons Section */}
            <div className="space-x-4 mt-8">
                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white py-3 px-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                    Login
                </button>

                {/* Signup Button */}
                <button
                    onClick={handleSignup}
                    className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-3 px-6 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                    Signup
                </button>
            </div>
        </div>
    );
}
