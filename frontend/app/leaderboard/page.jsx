'use client';

import React, { useState } from 'react';
import {
    Code2, Zap, Trophy, Rocket, Notebook, ChevronsRight,
    Users, Clock, ArrowLeft, Search, Lock, ChevronUp,
    ChevronDown, Info, ChevronLeft, ChevronRight, SendHorizontal,
    Brain, Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
    const router = useRouter();
    const [expandedRow, setExpandedRow] = useState(1); // Default expand rank 1
    const [activeTab, setActiveTab] = useState('overall');

    const toggleRow = (rank) => {
        if (expandedRow === rank) {
            setExpandedRow(null);
        } else {
            setExpandedRow(rank);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden text-gray-600 font-sans antialiased selection:bg-blue-100 selection:text-blue-700 bg-gray-50/50">
            {/* Left Sidebar (Navigation) */}
            <div className="w-16 border-r border-gray-200 bg-white flex flex-col items-center py-5 flex-shrink-0 z-30">
                {/* Logo */}
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-8 shadow-sm">
                    A
                </div>

                {/* Menu Icons */}
                <div className="flex flex-col gap-6 w-full px-3">
                    <button className="w-10 h-10 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors">
                        <Code2 className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors">
                        <Zap className="w-5 h-5" />
                    </button>
                    {/* Active State for Leaderboard */}
                    <button className="w-10 h-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center shadow-sm relative group">
                        <Trophy className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors">
                        <Rocket className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-center transition-colors">
                        <Notebook className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-auto">
                    <button className="w-10 h-10 text-gray-400 hover:text-gray-900 rounded-lg flex items-center justify-center transition-colors">
                        <ChevronsRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 relative">

                {/* Header (Sticky Top) */}
                <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 flex-shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <div>
                            <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                DSA Team Battle #12
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live
                                </span>
                            </h1>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-gray-400" /> 18 Teams</span>
                                <span className="w-0.5 h-3 bg-gray-300 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-gray-400" /> Ends in 45m</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Last Updated</div>
                            <div className="text-xs font-mono text-gray-700">10:42:15 AM</div>
                        </div>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200/50 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to IDE
                        </button>
                    </div>
                </header>

                {/* Scrollable Leaderboard Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto flex flex-col gap-6">

                        {/* Highlights Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Highlight Card 1 */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fastest Solve</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">BinaryBosses</div>
                                    <div className="text-xs text-gray-500 mt-0.5 font-mono">8m 12s • Problem A</div>
                                </div>
                            </div>

                            {/* Highlight Card 2 */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:border-purple-200 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
                                        <Brain className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Best Complexity</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Gowtham</div>
                                    <div className="text-xs text-gray-500 mt-0.5 font-mono">O(n log n) • Graph BFS</div>
                                </div>
                            </div>

                            {/* Highlight Card 3 */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:border-orange-200 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">On Fire</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">CodeCrushers</div>
                                    <div className="text-xs text-gray-500 mt-0.5">3 Problems in a row</div>
                                </div>
                            </div>

                            {/* Highlight Card 4 */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:border-blue-200 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Top Contributors</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">AlphaDevs</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Balanced solves</div>
                                </div>
                            </div>
                        </div>

                        {/* Main Leaderboard Card */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col min-h-[600px]">
                            {/* Toolbar & Tabs */}
                            <div className="px-5 pt-5 pb-0 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" placeholder="Search team or user..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
                                    </div>

                                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50">
                                        <button className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white shadow-sm rounded border border-gray-200">Team</button>
                                        <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Solo</button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex items-center gap-8">
                                    <button
                                        className={`pb-3 border-b-2 text-xs font-semibold tracking-wide transition-colors ${activeTab === 'overall' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'}`}
                                        onClick={() => setActiveTab('overall')}
                                    >
                                        Overall Rankings
                                    </button>
                                    <button
                                        className={`pb-3 border-b-2 text-xs font-medium tracking-wide transition-colors ${activeTab === 'team' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'}`}
                                        onClick={() => setActiveTab('team')}
                                    >
                                        Team View
                                    </button>
                                    <button
                                        className={`pb-3 border-b-2 text-xs font-medium tracking-wide transition-colors flex items-center gap-1.5 ${activeTab === 'individual' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'}`}
                                        onClick={() => setActiveTab('individual')}
                                    >
                                        Individual View
                                        <Lock className="w-3 h-3 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-200">
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-16 text-center">Rank</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score <Info className="w-3 h-3 inline ml-1 align-text-bottom opacity-50" /></th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Time</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Penalty</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">

                                        {/* Rank 1 */}
                                        <>
                                            <tr
                                                className={`group hover:bg-gray-50 transition-colors cursor-pointer ${expandedRow === 1 ? 'bg-blue-50/30' : ''}`}
                                                onClick={() => toggleRow(1)}
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    <div className="w-6 h-6 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold mx-auto border border-yellow-200">1</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-gray-100">B</div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                                BinaryBosses
                                                                <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">Leader</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                                                <Users className="w-3 h-3" /> 3 members
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">840</span>
                                                    <span className="text-[10px] text-emerald-600 font-medium ml-1">+20</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            <div className="w-1.5 h-6 rounded-sm bg-emerald-500" title="Solved"></div>
                                                            <div className="w-1.5 h-6 rounded-sm bg-emerald-500" title="Solved"></div>
                                                            <div className="w-1.5 h-6 rounded-sm bg-emerald-500" title="Solved"></div>
                                                            <div className="w-1.5 h-6 rounded-sm bg-emerald-500" title="Solved"></div>
                                                            <div className="w-1.5 h-6 rounded-sm bg-gray-200" title="Unsolved"></div>
                                                        </div>
                                                        <span className="text-xs font-mono text-gray-600 ml-1">4/5</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-gray-600">12m 45s</td>
                                                <td className="px-6 py-4 text-right text-xs font-mono text-red-500 font-medium">-20</td>
                                                <td className="px-4 text-gray-400">
                                                    {expandedRow === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </td>
                                            </tr>

                                            {/* EXPANDED DETAILS FOR RANK 1 */}
                                            {expandedRow === 1 && (
                                                <tr className="bg-gray-50/50">
                                                    <td colSpan="7" className="px-6 py-4 border-l-4 border-blue-500">
                                                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                                            <table className="w-full text-left">
                                                                <thead>
                                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Problem</th>
                                                                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                                                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Solved By</th>
                                                                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                                                                        <th className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-right">Points</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    <tr>
                                                                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">Subset Sum</td>
                                                                        <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Solved</span></td>
                                                                        <td className="px-4 py-2.5 flex items-center gap-2">
                                                                            <img src="https://ui-avatars.com/api/?name=Afsal&background=random" className="w-4 h-4 rounded-full ring-1 ring-gray-200" alt="" />
                                                                            <span className="text-xs text-gray-600">Afsal</span>
                                                                        </td>
                                                                        <td className="px-4 py-2.5 text-xs font-mono text-gray-500">11m 20s</td>
                                                                        <td className="px-4 py-2.5 text-xs font-mono text-gray-700 text-right font-medium">+200</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">Graphs BFS</td>
                                                                        <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Solved</span></td>
                                                                        <td className="px-4 py-2.5 flex items-center gap-2">
                                                                            <img src="https://ui-avatars.com/api/?name=Gowtham&background=random" className="w-4 h-4 rounded-full ring-1 ring-gray-200" alt="" />
                                                                            <span className="text-xs text-gray-600">Gowtham</span>
                                                                        </td>
                                                                        <td className="px-4 py-2.5 text-xs font-mono text-gray-500">18m 05s</td>
                                                                        <td className="px-4 py-2.5 text-xs font-mono text-gray-700 text-right font-medium">+180</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900">DP Optimization</td>
                                                                        <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">Wrong Answer</span></td>
                                                                        <td className="px-4 py-2.5 flex items-center gap-2">
                                                                            <div className="w-4 h-4 rounded-full bg-gray-200 text-[8px] flex items-center justify-center font-bold text-gray-500">?</div>
                                                                            <span className="text-xs text-gray-400 italic">Attempting...</span>
                                                                        </td>
                                                                        <td className="px-4 py-2.5 text-xs font-mono text-gray-500">--</td>
                                                                        <td className="px-4 py-2.5 text-xs font-mono text-red-500 text-right font-medium">-10</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>

                                        {/* Rank 2 */}
                                        <tr
                                            className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => toggleRow(2)}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-6 h-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold mx-auto border border-gray-200">2</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50">L</div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">LogicLords</div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                                            <Users className="w-3 h-3" /> 3 members
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">810</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-600 ml-1">3/5</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600">14m 10s</td>
                                            <td className="px-6 py-4 text-right text-xs font-mono text-gray-400 font-medium">0</td>
                                            <td className="px-4 text-gray-400">
                                                <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>
                                        </tr>

                                        {/* Rank 3 */}
                                        <tr
                                            className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => toggleRow(3)}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-6 h-6 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold mx-auto border border-orange-200">3</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-50">C</div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">CodeCrushers</div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                                            <Users className="w-3 h-3" /> 2 members
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">750</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-600 ml-1">3/5</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600">16m 22s</td>
                                            <td className="px-6 py-4 text-right text-xs font-mono text-gray-400 font-medium">-10</td>
                                            <td className="px-4 text-gray-400">
                                                <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>
                                        </tr>

                                        {/* User Rank (Highlighted) */}
                                        <tr
                                            className="group hover:bg-blue-50/50 transition-colors cursor-pointer bg-white border-l-2 border-l-blue-500"
                                            onClick={() => toggleRow(12)}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-xs font-mono text-gray-400">12</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-900 shadow-sm">
                                                        <img src="https://ui-avatars.com/api/?name=You&background=random" className="w-full h-full rounded-lg opacity-90" alt="" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                            You (Team A)
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                                            <Users className="w-3 h-3" /> 3 members
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">420</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-emerald-500"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                        <div className="w-1.5 h-6 rounded-sm bg-gray-200"></div>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-600 ml-1">2/5</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-600">22m 10s</td>
                                            <td className="px-6 py-4 text-right text-xs font-mono text-gray-400 font-medium">0</td>
                                            <td className="px-4 text-gray-400">
                                                <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination / Footer */}
                            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Showing 1-4 of 18 Teams</span>
                                <div className="flex items-center gap-2">
                                    <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Team Chat - Minimized for Focus) */}
            <div className="w-72 border-l border-gray-200 flex flex-col bg-white flex-shrink-0 z-20 hidden 2xl:flex">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/30">
                    <span className="text-xs font-semibold text-gray-900">Team Chat</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span className="text-[10px] text-gray-500">3 Online</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {/* Message */}
                    <div className="flex items-start gap-2">
                        <img src="https://ui-avatars.com/api/?name=Gowtham&background=random" className="w-6 h-6 rounded-full mt-1 border border-gray-100" alt="" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500 font-medium">Gowtham</span>
                            <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-2xl rounded-tl-sm text-xs border border-gray-200">
                                I just submitted the BFS solution. Check the rank!
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="flex items-start gap-2 flex-row-reverse">
                        <div className="flex flex-col items-end gap-1">
                            <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-tr-sm text-xs shadow-sm">
                                Nice! We jumped to #1.
                            </div>
                        </div>
                    </div>

                    <div className="text-center my-4">
                        <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded-full uppercase tracking-wider font-bold">System</span>
                        <div className="text-[10px] text-gray-400 mt-2">BinaryBosses solved "Graphs BFS" (+180pts)</div>
                    </div>
                </div>

                <div className="p-3 border-t border-gray-200">
                    <div className="relative">
                        <input type="text" placeholder="Message team..." className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
                        <button className="absolute right-2 top-2 text-blue-600 hover:text-blue-700">
                            <SendHorizontal className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
