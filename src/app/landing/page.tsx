"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sprout, ChartLine } from 'lucide-react';

export default function Landing() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            setIsVisible(true);
        }, 100);

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleLogin = () => router.push('/login');
    const handleSignup = () => router.push('/signup');

    return (
        <div className="relative flex flex-col min-h-screen">
            {/* Background image */}
            <img
                src="/landing-background.png"
                alt="Background"
                role="img"
                aria-label="Background image for landing page"
                className="absolute top-0 left-0 w-full h-full object-cover -z-10 brightness-90"
            />

            {/* Company name header */}
            <div className="w-full bg-black/75 backdrop-blur-sm shadow-md p-6 pt-10">
                <div className="max-w-7xl ml-20">
                    <div className="text-lime-600 text-4xl font-bold flex items-center gap-2">
                        <Sprout className="h-8 w-8" />
                        AgriTech
                        <ChartLine className="h-6 w-6 ml-2" />
                    </div>
                </div>
            </div>

            {/* Main content with illustration and content box */}
            <div className="flex-grow flex items-center justify-center w-full max-w-[65%] ml-[15%]">
                <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                    {/* Content Box */}
                    <div className="w-full md:w-3/5">
                        <div
                            className={`bg-black/70 backdrop-blur-sm rounded-xl shadow-xl p-12 w-full
                            transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}
                        >
                            <h1 className="text-6xl font-bold text-lime-700">
                                Towards a Net-Zero Goal
                            </h1>

                            <h2 className="text-2xl font-semibold text-white mb-8">
                                Unlock data-driven solutions that empower sustainable farming, 
                                optimize energy use, and reduce carbon footprint, guiding agriculture 
                                toward a net-zero future.
                            </h2>
                            {/* Button container */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleLogin}
                                    className="flex-1 bg-white hover:bg-lime-300 text-lime-600
                                    py-3 px-8 rounded-lg text-xl font-semibold shadow-lg
                                    transform hover:scale-105 transition-all duration-300 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-green/50"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={handleSignup}
                                    className="flex-1 bg-lime-600 hover:bg-lime-700 text-white 
                                    py-3 px-8 rounded-lg text-xl font-semibold shadow-lg
                                    transform hover:scale-105 transition-all duration-300 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-green-300"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Net Zero Drawing */}
                    <div className="hidden md:block w-3/5">
                        <div className="relative aspect-square max-w-5xl">
                            <img
                                src="/netZeroDrawing.png"
                                alt="Net Zero Agriculture Illustration"
                                className={`w-full h-full object-contain transition-all duration-1000 ease-in-out
                                ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-4'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}