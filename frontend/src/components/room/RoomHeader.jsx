export default function RoomHeader({
    title = "Clash Of Code",
    description = "Join active competitions or start your own."
}) {
    return (
        <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-700 drop-shadow-sm">
                {title}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-normal max-w-2xl mx-auto">{description}</p>
        </div>
    );
}
