import WorldMap from '@/components/ui/world-map';
import { Globe2 } from 'lucide-react';

export default function WorldMapBackground() {
    return (
        <>
            {/* Background World Map Container */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] z-0 opacity-40 pointer-events-none">
                <WorldMap
                    lineColor="#10b981"
                    dots={[
                        {
                            start: { lat: 64.2008, lng: -149.4937 }, // Alaska
                            end: { lat: 34.0522, lng: -118.2437 }, // LA
                        },
                        {
                            start: { lat: 64.2008, lng: -149.4937 },
                            end: { lat: -15.7975, lng: -47.8919 }, // Brazil
                        },
                        {
                            start: { lat: -15.7975, lng: -47.8919 },
                            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                        },
                        {
                            start: { lat: 51.5074, lng: -0.1278 }, // London
                            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                        },
                        {
                            start: { lat: 28.6139, lng: 77.209 },
                            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                        },
                        {
                            start: { lat: 28.6139, lng: 77.209 },
                            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                        },
                    ]}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>

            {/* Catchy Connect Text - Outside Map Container */}
            <div className="absolute top-[470px] left-0 right-0 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pointer-events-none z-0">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold tracking-wide uppercase text-xs mb-2">
                    <Globe2 className="w-4 h-4" />
                    <span>Global Network</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">
                    Connect with Players Worldwide
                </h3>
                <p className="text-slate-400 text-sm mt-1">Battle for glory across borders</p>
            </div>

            {/* Radial Gradient Glow */}
        </>
    );
}
