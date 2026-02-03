import { cn } from '@/lib/utils';

export default function StatsOverview({ stats }) {
    // stats is an array of objects: { label, value, icon, highlighted, className }

    return (
        <div className="w-full max-w-6xl mx-auto mb-12">
            {/* Main Card Container */}
            <div className="bg-white rounded-[2rem] border border-slate-200/90 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)]">
                {/* Grid Layout */}
                <div className={`grid grid-cols-1 ${stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} divide-y md:divide-y-0 md:divide-x divide-slate-200/90 items-stretch`}>

                    {stats.map((stat, index) => (
                        <div key={index} className={cn("flex flex-col items-center  py-8 px-6 text-center group relative", stat.className)}>
                            {stat.highlighted ? (
                                /* Highlighted Item (Rotated BG) */
                                <div className="w-20 h-20 mb-8 bg-emerald-500 rounded-[1.25rem] shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] flex items-center justify-center -rotate-6 transition-transform duration-300 group-hover:rotate-0 group-hover:-translate-y-1">
                                    <stat.icon strokeWidth={1.5} className="w-9 h-9 text-white rotate-6 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            ) : (
                                /* Standard Item */
                                <div className="w-20 h-20 mb-8 bg-white rounded-[1.25rem] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                                    <stat.icon strokeWidth={1.5} className="w-9 h-9 text-slate-800" />
                                </div>
                            )}

                            <h3 className="text-4xl font-semibold text-slate-900 tracking-tight mb-2">{stat.value}</h3>
                            <p className="text-lg text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
