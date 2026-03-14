"use client";

import { useEffect, useState } from 'react';
import { getServerProfileAction, updateUserProfileAction, createProfileWithImageAction, UserProfile } from '@/app/actions/profile';
import { AlertTriangle, ArrowRight, X, User, IdCard, Loader2, CheckCircle2 } from 'lucide-react';

export default function ComplianceBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [isFullProfile, setIsFullProfile] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [govIdType, setGovIdType] = useState('Aadhaar');
    const [govIdNumber, setGovIdNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const checkCompliance = async () => {
        try {
            const result = await getServerProfileAction();
            
            if (result.success) {
                const profile = result.profile;
                const full = result.isFullProfile;
                setIsFullProfile(full);
                
                // Check for "glitch" users: NO profile document or "Bridge" placeholder
                const isGlitchUser = !full || (profile?.name && profile.name.includes('Bridge'));
                
                if (isGlitchUser) {
                    setIsVisible(true);
                    if (profile?.userId) setUserId(profile.userId);
                    // Pre-fill if needed, but usually these are empty or garbage
                } else {
                    setIsVisible(false);
                }
            }
        } catch (err) {
            console.error("[COMPLIANCE_BANNER] Check failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkCompliance();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!name.trim() || !govIdNumber.trim()) {
            setError('All fields are mandatory.');
            return;
        }

        setIsSaving(true);
        try {
            let result;
            if (isFullProfile) {
                // Update existing record
                result = await updateUserProfileAction({
                    userId,
                    name,
                    govIdType,
                    govIdNumber
                });
            } else {
                // Create new record
                const formData = new FormData();
                formData.append('userId', userId);
                formData.append('name', name);
                formData.append('govIdType', govIdType);
                formData.append('govIdNumber', govIdNumber);
                result = await createProfileWithImageAction(formData);
            }

            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    setIsModalOpen(false);
                    setIsVisible(false);
                    // Optional: trigger a page refresh or state update in parent if needed
                    // window.location.reload(); 
                }, 2000);
            } else {
                setError(result.error || 'Failed to save profile.');
            }
        } catch (err: any) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !isVisible) return null;

    return (
        <>
            <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-[100] shadow-lg animate-in slide-in-from-top duration-500">
                <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-100 animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-wider">
                            Action Required: Mandatory Profile Update
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium opacity-90">
                        Your account is missing required registration details. Complete now to avoid service interruption.
                    </p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1 px-4 py-1.5 bg-white text-red-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all group shrink-0"
                    >
                        Update Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Small Window / Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="relative p-6 bg-slate-50 border-b border-slate-100">
                            <h3 className="text-xl font-black text-slate-900">Mandatory Update</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-tight">Complete your profile to continue</p>
                            {!isSuccess && (
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            {isSuccess ? (
                                <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 mb-2">Success!</h4>
                                    <p className="text-slate-500 font-medium tracking-tight">Your profile has been updated. This window will close shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
                                            <AlertTriangle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Full Name (Govt ID)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your full name"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-gov-blue outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">ID Type</label>
                                            <select 
                                                value={govIdType}
                                                onChange={(e) => setGovIdType(e.target.value)}
                                                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-gov-blue outline-none transition-all appearance-none"
                                            >
                                                <option>Aadhaar</option>
                                                <option>PAN Card</option>
                                                <option>Voter ID</option>
                                                <option>Driving License</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">ID Number</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gov-blue transition-colors">
                                                    <IdCard className="w-5 h-5" />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={govIdNumber}
                                                    onChange={(e) => setGovIdNumber(e.target.value)}
                                                    placeholder="Enter ID"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-gov-blue outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-5 bg-gov-blue text-white font-black rounded-2xl shadow-xl shadow-gov-blue/20 hover:shadow-2xl hover:shadow-gov-blue/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                                        {!isSaving && <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
