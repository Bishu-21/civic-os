"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Search, PlayCircle, LayoutGrid, LogOut, Menu, X } from "lucide-react";
import { generateDemoData } from "@/lib/store";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            // Priority 1: Check server action (most reliable)
            const { success } = await getCurrentUserAction();
            if (success) {
                setIsLoggedIn(true);
            } else {
                // Priority 2: client-side cookie fallback (faster for hydration)
                const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('a_session_'));
                setIsLoggedIn(hasCookie);
            }
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutAction();
            setIsLoggedIn(false);
            router.push("/");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleDemoMode = () => {
        generateDemoData();
        alert("Demo data generated! Refreshing page...");
        window.location.reload();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img 
                            alt="MCD CivicOS Logo" 
                            className="h-12 w-auto" 
                            src="/logo1.png" 
                        />
                        <div className="hidden sm:block border-l border-slate-300 h-8 mx-2"></div>
                        <Link href="/" className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Govt. of India</span>
                            <h1 className="text-gov-blue text-xl font-extrabold tracking-tight">CivicOS National</h1>
                        </Link>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-semibold text-gov-blue hover:text-primary transition-colors">Home</Link>
                    {isLoggedIn && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
                            <Link href="/map" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Spatial Map</Link>
                        </>
                    )}
                    <a href="#services" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">Services</a>
                    <a href="#footer" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">Help</a>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-6">
                    {isLoading ? (
                        <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
                    ) : isLoggedIn ? (
                        <>
                            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-gov-blue/5 text-gov-blue text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gov-blue/10 transition-all">
                                <LayoutGrid className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="hidden md:flex gap-6">
                                <Link href="/auth" className="text-slate-600 font-bold hover:text-primary transition-colors">Login</Link>
                            </div>
                            <Link href="/auth" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 shadow-md shadow-primary/20 transition-all hidden sm:block">
                                Register
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-gov-blue hover:bg-slate-50 rounded-lg transition-colors">Home</Link>
                    {isLoggedIn && (
                        <>
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
                            <Link href="/map" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Spatial Map</Link>
                        </>
                    )}
                    <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors block">Services</a>
                    <a href="#footer" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors block">Help</a>
                    
                    {!isLoggedIn && (
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-center text-gov-blue hover:bg-slate-50 rounded-lg transition-colors">Login</Link>
                            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-center text-white bg-primary rounded-lg shadow-md">Register</Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
