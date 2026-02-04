import { cn } from '@/lib/utils';
import { ArrowRight, Lock, Wifi, Zap } from 'lucide-react';

export default function RoomCard({ room, onJoin }) {
    const isPrivate = room.settings?.privacy === 'private' || room.hasPassword;
    const isFull = room.totalParticipants >= room.settings?.maxTeamSize;
    const isPlaying = room.status === 'PLAYING';

    // Determine status and availability
    let statusText = 'Going to start';
    let isAvailable = true;
    let StatusIcon = Wifi;
    let statusColor = 'text-slate-700';

    if (isPlaying) {
        statusText = 'Room in live';
        isAvailable = false;
        StatusIcon = Zap;
        statusColor = 'text-green-700';
    } else if (isFull) {
        statusText = 'Closed';
        isAvailable = false;
        StatusIcon = Lock;
        statusColor = 'text-red-500';
    }

    return (
        <div className="flex flex-col items-start bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200 relative overflow-hidden group">

            {/* Icon & Title Row */}
            <div className="flex items-center gap-4 mb-6 w-full">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05),0_1px_0_inset_rgba(255,255,255,1)] shrink-0">
                    <StatusIcon width={20} height={20} strokeWidth={1.5} className={statusColor} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate w-full font-[family-name:var(--font-space)]">
                    {room.name}
                </h3>
            </div>

            {/* Details */}
            <div className="w-full mb-6">
                <div className="mb-3 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-[family-name:var(--font-inter)]">Battle Intel</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 w-full border-t border-b border-gray-100 py-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider font-[family-name:var(--font-inter)]">Participants</span>
                        <span className="text-lg font-semibold text-slate-900 font-[family-name:var(--font-mono)]">{room.totalParticipants}</span>
                    </div>

                    <div className="flex flex-col gap-0.5 pl-4 border-l border-gray-200">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider font-[family-name:var(--font-inter)]">Max Size</span>
                        <span className="text-lg font-semibold text-slate-900 font-[family-name:var(--font-mono)]">{room.settings?.maxTeamSize}</span>
                    </div>

                    <div className="flex flex-col gap-0.5 pl-4 border-l border-gray-200">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider font-[family-name:var(--font-inter)]">Status</span>
                        <span className={cn("text-lg font-semibold truncate max-w-[120px] font-[family-name:var(--font-space)] tracking-tight", statusColor)}>{statusText}</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => onJoin(room)}
                disabled={!isAvailable}
                className={cn(
                    "w-full mt-auto py-2 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                    isAvailable
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
            >
                {isAvailable ? (
                    <>
                        Join Room <ArrowRight className="w-4 h-4" />
                    </>
                ) : (
                    <span>{statusText}</span>
                )}
            </button>

        </div>
    );
}
