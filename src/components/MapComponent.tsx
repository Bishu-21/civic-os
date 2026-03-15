"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint } from '@/lib/types';
import { ShieldAlert, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// Fix Leaflet marker icon issues
const createCustomIcon = (status: string) => {
    const color = status === 'Resolved' ? '#10b981' : status === 'In Progress' ? '#f59e0b' : '#ef4444';
    
    const html = ReactDOMServer.renderToString(
        <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300" style={{ backgroundColor: color }}>
                {status === 'Resolved' ? <CheckCircle className="w-5 h-5 text-white" /> : 
                 status === 'In Progress' ? <AlertCircle className="w-5 h-5 text-white" /> : 
                 <ShieldAlert className="w-5 h-5 text-white" />}
            </div>
            <div className="w-1 h-3 shadow-lg -mt-0.5" style={{ backgroundColor: color }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black/20 blur-[1px] mt-0.5"></div>
        </div>
    );

    return L.divIcon({
        html,
        className: 'custom-leaflet-icon',
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48]
    });
};

const UserLocationIcon = L.divIcon({
    html: ReactDOMServer.renderToString(
        <div className="relative">
            <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute inset-x-0 -bottom-4 flex justify-center">
                <div className="w-4 h-1 bg-black/20 blur-[2px] rounded-full"></div>
            </div>
        </div>
    ),
    className: 'user-location-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function MapSync({ center }: { center: [number, number] | null }) {
    const map = useMap();
    if (center) {
        map.setView(center, map.getZoom(), { animate: true });
    }
    return null;
}

interface MapComponentProps {
    grievances: Complaint[];
    userLocation: [number, number] | null;
    onTrackTicketAction: (id: string) => void;
    onSelectComplaint?: (complaint: Complaint) => void;
}

export default function MapComponent({ grievances, userLocation, onTrackTicketAction, onSelectComplaint }: MapComponentProps) {
    const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi

    return (
        <MapContainer 
            center={userLocation || defaultCenter} 
            zoom={13} 
            className="w-full h-full z-0"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Default overlay hidden - using custom controls in page.tsx */}
            <MapSync center={userLocation} />

            {userLocation && (
                <Marker position={userLocation} icon={UserLocationIcon}>
                    <Popup className="premium-popup">
                        <div className="p-3">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">You are here</p>
                            <p className="text-xs font-bold text-slate-800">Current Position</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {grievances.map((g) => (
                <Marker 
                    key={g.id} 
                    position={[g.lat, g.lng]} 
                    icon={createCustomIcon(g.status)}
                    eventHandlers={{
                        click: () => onSelectComplaint?.(g)
                    }}
                >
                    <Popup className="premium-popup">
                        <div className="p-4 w-64">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                    g.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {g.status}
                                </span>
                                <span className="text-[8px] font-bold text-slate-400">#{g.id}</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-800 mb-1">{g.category}</h3>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">{g.description}</p>
                            <button 
                                onClick={() => onTrackTicketAction(g.id)}
                                className="w-full py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-1"
                            >
                                Live Tracking <Navigation className="w-3 h-3" />
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
