'use client';

import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { useChatPanel } from "@/contexts/ChatPanelContext";
import { ChevronLeft, ChevronRight, MessageSquare, Scan, Send, Users } from 'lucide-react';

const ChatPanel = () => {
    const { isCollapsed, toggleCollapse, expand } = useChatPanel();

    if (isCollapsed) {
        return (
            <div className="flex flex-col items-center py-3 px-1 bg-white border-l border-gray-200 h-full">
                {/* Vertical Label */}
                <div className="flex flex-col gap-3 flex-1 pt-2">
                    <button
                        onClick={() => expand()}
                        className="flex flex-col items-center gap-1.5 px-1.5 py-2 text-xs font-medium transition-all rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 bg-blue-50 text-blue-600"
                    >
                        <MessageSquare className="w-4 h-4 stroke-[1.5] text-blue-600" />
                        <span className="writing-mode-vertical text-[10px] font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Team Chat
                        </span>
                    </button>
                </div>

                {/* Expand Button */}
                <button
                    onClick={toggleCollapse}
                    className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100 mt-3"
                    title="Expand"
                >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Chat Header */}
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between shrink-0 h-[45px]">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">JD</div>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">AS</div>
                    </div>
                    <div className="flex flex-col leading-none">
                        <TypographySmall className="text-xs font-bold text-gray-900">Team Chat</TypographySmall>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] text-gray-500 font-medium">3 Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
                        <Users className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100" title="Full Screen">
                        <Scan className="w-4 h-4 stroke-[1.5]" />
                    </button>
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                        title="Collapse"
                    >
                        <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">No messages yet</p>
                        <TypographyMuted className="text-xs">Start a conversation with your teammates</TypographyMuted>
                    </div>
                </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/30">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    />
                    <button className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-sm active:scale-95 group-focus-within:shadow-indigo-200">
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
