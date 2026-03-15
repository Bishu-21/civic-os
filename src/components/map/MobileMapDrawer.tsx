import { X, Filter, CheckCircle, Clock3, AlertCircle, Droplets, Zap, Trash2, Route, Construction, Siren, Sparkles, LayoutDashboard, Map as MapIcon, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileMapDrawerProps {
    isOpen: boolean;
    onCloseAction: () => void;
    selectedCategories: string[];
    toggleCategoryAction: (cat: string) => void;
    selectedStatuses: string[];
    toggleStatusAction: (stat: string) => void;
    onResetAction: () => void;
    categories: string[];
}

export default function MobileMapDrawer({
    isOpen,
    onCloseAction,
    selectedCategories,
    toggleCategoryAction,
    selectedStatuses,
    toggleStatusAction,
    onResetAction,
    categories
}: MobileMapDrawerProps) {
    const pathname = usePathname();
    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity lg:hidden"
                onClick={onCloseAction}
            />
            <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[101] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] transition-all transform translate-y-0 lg:hidden max-h-[85vh] overflow-hidden flex flex-col border-t border-slate-100">
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <div className="p-6 flex flex-col">
                        {/* Premium Handle */}
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full self-center mb-10 shadow-inner" />
                        
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gov-blue/10 rounded-2xl text-gov-blue shadow-sm">
                                    <Filter className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">MAP FILTERS</h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Customize Map View</span>
                                </div>
                            </div>
                            <button 
                                onClick={onCloseAction}
                                className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 transition-all active:scale-95"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Quick Navigation Section */}
                        <div className="mb-10 px-2 mt-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Navigation</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link 
                                    href="/dashboard"
                                    className={`flex items-center gap-3 p-4 rounded-3xl transition-all border-2 ${
                                        pathname === '/dashboard' 
                                            ? 'bg-gov-blue/5 border-gov-blue text-gov-blue shadow-inner' 
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl flex items-center justify-center ${pathname === '/dashboard' ? 'bg-gov-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <LayoutDashboard className="w-5 h-5" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-wider">Dashboard</span>
                                </Link>
                                <Link 
                                    href="/map"
                                    className={`flex items-center gap-3 p-4 rounded-3xl transition-all border-2 ${
                                        pathname === '/map' 
                                            ? 'bg-gov-blue/5 border-gov-blue text-gov-blue shadow-inner' 
                                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl flex items-center justify-center ${pathname === '/map' ? 'bg-gov-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <MapIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-wider">Map</span>
                                </Link>
                            </div>
                        </div>


                        <div className="space-y-10 px-2 pb-12">
                            {/* Categories - Premium Pill Scroll */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Layer</h3>
                                    <button onClick={onResetAction} className="text-[10px] text-gov-blue font-black uppercase bg-gov-blue/10 px-3 py-1 rounded-full transition-all active:scale-95">Clear All</button>
                                </div>
                                <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2">
                                    {categories.map(cat => {
                                        const isSelected = selectedCategories.includes(cat);
                                        const CategoryIcon = 
                                            cat === 'Water' ? Droplets :
                                            cat === 'Streetlight' ? Zap :
                                            cat === 'Garbage' ? Trash2 :
                                            cat === 'Road Damage' ? Route : 
                                            cat === 'Construction' ? Construction : Siren;

                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategoryAction(cat)}
                                                className={`flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                                                    isSelected
                                                        ? 'bg-gov-blue border-gov-blue text-white shadow-xl shadow-blue-100 ring-4 ring-blue-50'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                                }`}
                                            >
                                                <CategoryIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gov-blue'}`} />
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status - Premium Card Grid */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'Pending', label: 'REPORTED', color: 'bg-red-500', icon: AlertCircle, desc: 'Awaiting' },
                                        { id: 'In Progress', label: 'ONGOING', color: 'bg-amber-500', icon: Clock3, desc: 'Field Work' },
                                        { id: 'Resolved', label: 'FIXED', color: 'bg-emerald-500', icon: CheckCircle, desc: 'Verified' }
                                    ].map(status => {
                                        const isSelected = selectedStatuses.includes(status.id);
                                        return (
                                            <button
                                                key={status.id}
                                                onClick={() => toggleStatusAction(status.id)}
                                                className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all border-2 relative overflow-hidden group ${
                                                    isSelected
                                                        ? 'bg-gov-blue/5 border-gov-blue ring-4 ring-gov-blue/5 shadow-inner'
                                                        : 'bg-white border-slate-100 hover:border-slate-200'
                                                }`}
                                            >
                                                <status.icon className={`w-6 h-6 mb-3 transition-transform group-hover:scale-110 ${isSelected ? 'text-gov-blue' : 'text-slate-300'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest z-10 ${isSelected ? 'text-gov-blue' : 'text-slate-400'}`}>
                                                    {status.label}
                                                </span>
                                                <span className={`text-[8px] font-bold uppercase tracking-tighter mt-1 ${isSelected ? 'text-gov-blue/60' : 'text-slate-300'}`}>
                                                    {status.desc}
                                                </span>
                                                <div className={`absolute top-0 right-0 w-2 h-2 ${status.color} rounded-bl-lg opacity-80`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={onCloseAction}
                                className="w-full py-5 bg-gov-blue text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-200 active:scale-95 transition-all mt-4 border-b-4 border-blue-900 group flex items-center justify-center gap-3"
                            >
                                UPDATE TRACKER <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
}
