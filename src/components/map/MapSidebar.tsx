"use client";

import React from 'react';
import { Filter, ChevronDown, CheckCircle, Clock3, AlertCircle, Download, LayoutGrid, Info } from 'lucide-react';

interface MapSidebarProps {
    selectedCategories: string[];
    toggleCategoryAction: (cat: string) => void;
    selectedStatuses: string[];
    toggleStatusAction: (stat: string) => void;
    onResetAction: () => void;
    onExportAction: () => void;
    filteredCount: number;
    categories: string[];
}

export default function MapSidebar({
    selectedCategories,
    toggleCategoryAction,
    selectedStatuses,
    toggleStatusAction,
    onResetAction,
    onExportAction,
    filteredCount,
    categories
}: MapSidebarProps) {
    return (
        <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 flex-col overflow-y-auto">
            <div className="p-6 space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                            <Filter className="w-4 h-4 text-gov-blue" />
                            Map Filters
                        </h2>
                        <button 
                            onClick={onResetAction}
                            className="text-[10px] text-gov-blue font-black uppercase tracking-widest hover:underline"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Categories</h3>
                            <div className="grid grid-cols-1 gap-1">
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCategories.includes(cat)}
                                                onChange={() => toggleCategoryAction(cat)}
                                                className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-gov-blue checked:border-gov-blue transition-all"
                                            />
                                            <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</h3>
                            <div className="space-y-1">
                                {[
                                    { id: 'Pending', color: 'bg-red-500', icon: AlertCircle },
                                    { id: 'In Progress', color: 'bg-amber-500', icon: Clock3 },
                                    { id: 'Resolved', color: 'bg-emerald-500', icon: CheckCircle }
                                ].map(status => (
                                    <label key={status.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedStatuses.includes(status.id)}
                                                onChange={() => toggleStatusAction(status.id)}
                                                className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-gov-blue checked:border-gov-blue transition-all"
                                            />
                                            <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{status.id}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <Info className="w-4 h-4 text-gov-blue" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Map Insights</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            Showing {filteredCount} active reports
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onExportAction}
                    className="w-full py-3.5 bg-gov-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                >
                    <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Export Dataset
                </button>
            </div>
        </aside>
    );
}
