"use client";

import { HiInformationCircle } from "react-icons/hi";

export default function LiveActivityStrip() {
    return (
        <div className="w-full bg-[#EBF5FF] border-y border-blue-200/60 py-3 sticky top-[72px] z-40 shadow-sm">
            <div className="container mx-auto px-4 md:px-10 lg:px-20">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-gov-blue text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-md shrink-0">
                            <HiInformationCircle className="w-3.5 h-3.5" />
                            Challenge Update
                        </span>
                        <p className="text-xs md:text-sm font-semibold text-slate-700">
                            Delhi grievance workflows are set up for districts, wards, and department routing. Keep the flow simple, visible, and easy to audit.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-gov-blue/80 uppercase tracking-wider">
                        <span>Demo flow ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
