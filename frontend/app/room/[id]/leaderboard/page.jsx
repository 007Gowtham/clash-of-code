'use client';

import RoomHeader from '@/components/room/RoomHeader';
// StatsOverview removed in favor of custom Podium layout
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TypographyH1, TypographyH2, TypographyH3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Medal, Trophy, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock data - replace with actual API call
const MOCK_TEAMS = [
    {
        id: 't1',
        name: 'Code Warriors',
        members: [
            { id: 'm1', name: 'Alice Johnson', role: 'Leader', problemsAssigned: 5, problemsSolved: 3, score: 150 },
            { id: 'm2', name: 'Bob Smith', role: 'Member', problemsAssigned: 4, problemsSolved: 2, score: 100 },
            { id: 'm3', name: 'Carol White', role: 'Member', problemsAssigned: 3, problemsSolved: 3, score: 150 }
        ],
        score: 400,
        problemsSolved: 8,
        averageTime: 45,
        streak: 3
    },
    {
        id: 't2',
        name: 'Binary Beasts',
        members: [
            { id: 'm4', name: 'David Lee', role: 'Leader', problemsAssigned: 6, problemsSolved: 4, score: 200 },
            { id: 'm5', name: 'Emma Davis', role: 'Member', problemsAssigned: 5, problemsSolved: 3, score: 150 }
        ],
        score: 350,
        problemsSolved: 7,
        averageTime: 50,
        streak: 2
    },
    {
        id: 't3',
        name: 'Algorithm Aces',
        members: [
            { id: 'm6', name: 'Frank Wilson', role: 'Leader', problemsAssigned: 7, problemsSolved: 5, score: 250 },
            { id: 'm7', name: 'Grace Taylor', role: 'Member', problemsAssigned: 4, problemsSolved: 2, score: 100 },
            { id: 'm8', name: 'Henry Brown', role: 'Member', problemsAssigned: 3, problemsSolved: 1, score: 50 }
        ],
        score: 400,
        problemsSolved: 8,
        averageTime: 40,
        streak: 4
    },
    {
        id: 't4',
        name: 'Data Dynamos',
        members: [
            { id: 'm9', name: 'Ivy Martinez', role: 'Leader', problemsAssigned: 5, problemsSolved: 2, score: 100 },
            { id: 'm10', name: 'Jack Anderson', role: 'Member', problemsAssigned: 3, problemsSolved: 1, score: 50 }
        ],
        score: 150,
        problemsSolved: 3,
        averageTime: 60,
        streak: 1
    },
    {
        id: 't5',
        name: 'Data Dynamos',
        members: [
            { id: 'm9', name: 'Ivy Martinez', role: 'Leader', problemsAssigned: 5, problemsSolved: 2, score: 100 },
            { id: 'm10', name: 'Jack Anderson', role: 'Member', problemsAssigned: 3, problemsSolved: 1, score: 50 }
        ],
        score: 150,
        problemsSolved: 3,
        averageTime: 60,
        streak: 1
    },
    {
        id: 't6',
        name: 'Data Dynamos',
        members: [
            { id: 'm9', name: 'Ivy Martinez', role: 'Leader', problemsAssigned: 5, problemsSolved: 2, score: 100 },
            { id: 'm10', name: 'Jack Anderson', role: 'Member', problemsAssigned: 3, problemsSolved: 1, score: 50 }
        ],
        score: 150,
        problemsSolved: 3,
        averageTime: 60,
        streak: 1
    },
    {
        id: 't7',
        name: 'Data Dynamos',
        members: [
            { id: 'm9', name: 'Ivy Martinez', role: 'Leader', problemsAssigned: 5, problemsSolved: 2, score: 100 },
            { id: 'm10', name: 'Jack Anderson', role: 'Member', problemsAssigned: 3, problemsSolved: 1, score: 50 }
        ],
        score: 150,
        problemsSolved: 3,
        averageTime: 60,
        streak: 1
    },

];

export default function LeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.id;

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            // Sort teams by score (descending)
            const sortedTeams = [...MOCK_TEAMS].sort((a, b) => b.score - a.score);
            setTeams(sortedTeams);
            setLoading(false);
        }, 1000);
    }, []);

    const topTeams = teams.slice(0, 3);
    const remainingTeams = teams.slice(3);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white text-slate-900 min-h-screen flex flex-col relative antialiased font-sans overflow-hidden">
            {/* Background Grid */}
            <InteractiveGridPattern
                chessBoard={true}
                className={cn(
                    "absolute inset-0 top-0 h-[600px] z-0",
                    "[mask-image:linear-gradient(to_bottom,black_30%,transparent_100%),linear-gradient(to_right,transparent_0%,black_20%,black_80%,transparent_100%)]",
                    "[-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_100%),linear-gradient(to_right,transparent_0%,black_20%,black_80%,transparent_100%)]",
                    "[mask-composite:intersect]",
                    "[-webkit-mask-composite:source-in]"
                )}
                width={50}
                height={50}
                squares={[80, 80]}
                squaresClassName="hover:fill-emerald-400/40 transition-all duration-500"
            />

            {/* Radial Gradient Glow */}

            <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">

                {/* Header */}
                <RoomHeader
                    title="Clash Of Code"
                    description="The hall of fame for code-golfing legends."
                />

                {/* Back Link */}
                <div className="w-full max-w-6xl mx-auto mb-5 flex justify-start">
                    <button
                        onClick={() => router.push(`/room/${roomId}/waiting`)}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Waiting Room</span>
                    </button>
                </div>

                {/* Page Title */}
                {/* Page Title & Motivation */}
                <div className="w-full max-w-6xl mx-auto mb-12 text-center sm:text-left relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-50 border border-slate-200/60 mb-4 transition-all hover:bg-slate-100 hover:border-slate-300 group cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold tracking-[0.15em] text-slate-500 uppercase font-mono group-hover:text-slate-700">DSA Multiplayer Arena</span>
                    </div>

                    <TypographyH1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-4 font-[family-name:var(--font-space)]">
                        Prove Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Mastery.</span>
                    </TypographyH1>

                    <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed font-[family-name:var(--font-inter)]">
                        Compete in real-time battles, crush complexity, and rise to the top.
                        <span className="block sm:inline text-slate-900 font-semibold mt-1 sm:mt-0"> Only the most optimized code wins.</span>
                    </p>
                </div>

                {/* Podium Overview (Separate Cards) */}
                <div className="w-full max-w-5xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

                    {/* Rank 2 (Left) */}
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center text-center order-2 md:order-1 transition-transform hover:-translate-y-1">
                        <div className="w-20 h-20 mb-6 bg-slate-50 rounded-[1.25rem] shadow-sm border border-slate-100 flex items-center justify-center">
                            <Medal strokeWidth={1.5} className="w-9 h-9 text-slate-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 font-[family-name:var(--font-space)] tracking-tight">{topTeams[1]?.score || 0} <span className="text-lg text-slate-400 font-normal">pts</span></h3>
                        <p className="text-slate-500 font-semibold mb-3 font-[family-name:var(--font-inter)]">2nd Place</p>
                        <TypographyH3 className="text-lg text-slate-700 truncate w-full font-[family-name:var(--font-inter)]">{topTeams[1]?.name || '-'}</TypographyH3>
                    </div>

                    {/* Rank 1 (Center - Elevated) */}
                    <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.15)] p-8 flex flex-col items-center text-center order-1 md:order-2 relative z-10 transform md:-translate-y-8 min-h-[320px] justify-center">
                        {/* Crown/Glow */}


                        <div className="w-24 h-24 mb-6 bg-emerald-500 rounded-[1.5rem] shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-all">
                            <Trophy strokeWidth={1.5} className="w-10 h-10 text-white" />
                        </div>

                        <h3 className="text-4xl font-extrabold text-slate-900 mb-2 font-[family-name:var(--font-space)] tracking-tight">{topTeams[0]?.score || 0} <span className="text-xl text-slate-400 font-normal">pts</span></h3>
                        <p className="text-emerald-600 font-bold mb-4 uppercase tracking-wider text-sm font-[family-name:var(--font-inter)]">Winner</p>
                        <TypographyH2 className="text-2xl text-slate-900 truncate w-full border-none pb-0 font-[family-name:var(--font-space)] tracking-tight">{topTeams[0]?.name || 'TBD'}</TypographyH2>
                    </div>

                    {/* Rank 3 (Right) */}
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center text-center order-3 transition-transform hover:-translate-y-1">
                        <div className="w-20 h-20 mb-6 bg-slate-50 rounded-[1.25rem] shadow-sm border border-slate-100 flex items-center justify-center">
                            <Medal strokeWidth={1.5} className="w-9 h-9 text-amber-700" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 font-[family-name:var(--font-space)] tracking-tight">{topTeams[2]?.score || 0} <span className="text-lg text-slate-400 font-normal">pts</span></h3>
                        <p className="text-slate-500 font-semibold mb-3 font-[family-name:var(--font-inter)]">3rd Place</p>
                        <TypographyH3 className="text-lg text-slate-700 truncate w-full font-[family-name:var(--font-inter)]">{topTeams[2]?.name || '-'}</TypographyH3>
                    </div>

                </div>

                {/* Full Leaderboard Table (All Teams) */}
                <div className="w-full max-w-6xl mx-auto">
                    <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]">
                        {/* Table Header */}
                        <div className="px-8 py-6 border-b border-slate-200/60 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                            <TypographyH3 className="text-slate-900 border-none pb-0 flex items-center gap-2 font-[family-name:var(--font-space)] tracking-tight">
                                <Trophy className="w-5 h-5 text-emerald-600" />
                                Full Rankings
                            </TypographyH3>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-[family-name:var(--font-mono)] uppercase tracking-wide">
                                Live Updates
                            </span>
                        </div>

                        <Table className='w-full'>
                            <TableHeader>
                                <TableRow className="bg-slate-100/50 hover:bg-slate-100/50 border-b border-slate-200/60">
                                    <TableHead className="w-[80px] font-bold text-slate-900 text-sm uppercase tracking-wider py-4 px-6 font-[family-name:var(--font-inter)]">Rank</TableHead>
                                    <TableHead className="w-[35%] font-bold text-slate-900 text-sm uppercase tracking-wider py-4 font-[family-name:var(--font-inter)]">Team Name</TableHead>
                                    <TableHead className="w-[15%] font-bold text-slate-900 text-sm uppercase tracking-wider py-4 font-[family-name:var(--font-inter)]">Members</TableHead>
                                    <TableHead className="w-[20%] font-bold text-slate-900 text-sm uppercase tracking-wider py-4 font-[family-name:var(--font-inter)]">Problems Solved</TableHead>
                                    <TableHead className="w-[15%] text-right font-bold text-slate-900 text-sm uppercase tracking-wider py-4 px-6 font-[family-name:var(--font-inter)]">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.slice(3).map((team, index) => {
                                    const actualRank = index + 4; // Start from rank 4
                                    return (
                                        <TableRow
                                            key={team.id}
                                            className={`
                                                cursor-pointer transition-all duration-200 border-b border-slate-100/50 last:border-0
                                                ${index % 2 === 0 ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30 hover:bg-slate-100/40'}
                                            `}
                                            onClick={() => setSelectedTeam(team)}
                                        >
                                            <TableCell className="text-slate-900 text-lg font-bold py-5 px-6 font-[family-name:var(--font-mono)]">
                                                <span className="text-slate-500">#</span>{actualRank}
                                            </TableCell>
                                            <TableCell className="text-slate-900 text-lg font-semibold py-5 font-[family-name:var(--font-inter)]">
                                                {team.name}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-base py-5 font-[family-name:var(--font-inter)]">
                                                <span className="inline-flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {team.members.length}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-base py-5">
                                                <div className="flex items-center gap-2 px-10">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    <span className="font-[family-name:var(--font-mono)] font-bold text-slate-700">{team.problemsSolved}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-900 text-xl font-bold py-5 px-6 font-[family-name:var(--font-mono)]">
                                                {team.score}
                                                <span className="text-xs text-slate-400 font-normal ml-1 font-[family-name:var(--font-inter)]">pts</span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Team Members Slide-out Sheet */}
                <Sheet open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
                    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="text-2xl font-bold flex items-center gap-2 font-[family-name:var(--font-space)]">
                                {selectedTeam?.name}
                            </SheetTitle>
                            <SheetDescription>
                                Detailed performance metrics and member stats
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-8 space-y-8">
                            {/* Team Stats Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Members</p>
                                    <p className="text-2xl font-bold text-slate-900 font-mono">{selectedTeam?.members.length}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Solved</p>
                                    <p className="text-2xl font-bold text-slate-900 font-mono">{selectedTeam?.problemsSolved}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Score</p>
                                    <p className="text-2xl font-bold text-slate-900 font-mono">{selectedTeam?.score}</p>
                                </div>
                            </div>

                            {/* Members Table */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-[family-name:var(--font-space)]">
                                    <Users className="w-5 h-5 text-slate-500" />
                                    Team Members
                                </h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead className="font-bold text-slate-700 text-base">Name</TableHead>
                                                <TableHead className="font-bold text-slate-700 text-base">Role</TableHead>
                                                <TableHead className="text-right font-bold text-slate-700 text-base">Score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedTeam?.members.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell className="font-medium text-slate-900 text-base">{member.name}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'Leader'
                                                            ? 'bg-indigo-100 text-indigo-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {member.role}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-900 text-base font-mono">{member.score}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </main>
        </div>
    );
}
