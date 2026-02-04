'use client';

import ChatPanel from '@/components/room/code-editor/ChatPanel/index';
import EditorPanel from '@/components/room/code-editor/EditorPanel/index';
import ProblemPanel from '@/components/room/code-editor/ProblemPanel/index';
import ResultsPanel from '@/components/room/code-editor/ResultsPanel/index';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CanvasBoard from '@/components/Whiteboard/CanvasBoard';
import { WhiteboardProvider } from '@/components/Whiteboard/WhiteboardContext';
import { ChatPanelProvider, useChatPanel } from '@/contexts/ChatPanelContext';
import { ProblemPanelProvider, useProblemPanel } from '@/contexts/ProblemPanelContext';
import { ResultsPanelProvider, useResultsPanel } from '@/contexts/ResultsPanelContext';
import { cn } from '@/lib/utils';
import { Code2, PenTool, Zap } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function CodeEditorContent() {
  const params = useParams();

  const resizeStartedRef = useRef(0);

  const { id: roomId, teamId } = params;
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const isArchitect = role === 'architect';
  const isBuilder = role === 'builder';
  const isDebugger = role === 'debugger';
  const isOptimiser = role === 'optimiser';
  const [activeTab, setActiveTab] = useState('editor');

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const needsSocket = isArchitect || isBuilder || isDebugger || isOptimiser;
    if (needsSocket && !socket) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [role, socket]);

  const { panelSize: resultsPanelSize } = useResultsPanel();
  const { panelSize: problemPanelSize, expand, isCollapsed } = useProblemPanel();
  const { panelSize: chatPanelSize } = useChatPanel();

  return (
    <div className="h-screen w-full bg-gray-50 text-gray-800 overflow-hidden flex flex-col antialiased font-sans">
      {/* Motivating Header */}
      <header className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-800 font-[family-name:var(--font-space)] tracking-tight">DSA Arena</span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500 animate-pulse" />
          <h1 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase font-[family-name:var(--font-space)]">
            Execute <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Perfection</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Live Session
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-3 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="flex-1 gap-1">

          {/* 1. Left Panel: Problem Description Container */}
          <ResizablePanel
            key={`problem-${problemPanelSize}`}
            defaultSize={problemPanelSize}
            minSize={5}
            collapsible={true}


            className="bg-white  rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
          >
            <ProblemPanel />
          </ResizablePanel>


          {/* 2. Middle Panel: Dynamic Workspace/Chat (Hidden for Builder and Optimiser) */}
          {(!isBuilder && !isOptimiser && !isDebugger) && (
            <ResizablePanel defaultSize={50} minSize={30}>
              {isArchitect ? (
                <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
                  <WhiteboardProvider roomId={roomId} socket={socket} isArchitect={true}>
                    <CanvasBoard isArchitect={true} />
                  </WhiteboardProvider>
                </div>
              ) : (
                <ResizablePanelGroup orientation="vertical" className="gap-1 h-full">
                  {/* Top: Code Editor Container */}
                  <ResizablePanel
                    defaultSize={100 - resultsPanelSize}
                    minSize={30}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
                  >
                    <EditorPanel />
                  </ResizablePanel>


                  {/* Bottom: Test Result Container */}
                  <ResizablePanel
                    key={`results-${resultsPanelSize}`}
                    defaultSize={resultsPanelSize}
                    minSize={5}
                    collapsible={true}
                    className="bg-white rounded-xl mt-10  shadow-sm border border-gray-200 flex flex-col overflow-hidden"
                  >
                    <ResultsPanel />
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </ResizablePanel>
          )}

          {(!isArchitect) && (
            <>
              {!isOptimiser && <ResizableHandle withHandle className="bg-transparent w-1 hover:bg-indigo-500/10 transition-colors" />}

              {/* 3. Right Panel: Workspace (for Builder/Debugger/Optimiser) or Team Chat (for Developer) */}
              <ResizablePanel
                key={isBuilder || isDebugger || isOptimiser ? `workspace-${role}-${activeTab}` : `chat-${chatPanelSize}`}
                defaultSize={isBuilder || isDebugger ? 75 : isOptimiser ? 75 : chatPanelSize}
                minSize={isBuilder || isDebugger || isOptimiser ? 40 : 5}
                collapsible={!isBuilder && !isDebugger && !isOptimiser}
                className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
              >
                {isBuilder || isDebugger || isOptimiser ? (
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Seamless Tab Switcher - Standardized UI */}
                    <div className="flex items-center justify-between px-2 pt-2 border-b border-gray-200 bg-gray-50/50 shrink-0">
                      <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {!isOptimiser && (
                          <button
                            onClick={() => setActiveTab('editor')}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all relative",
                              activeTab === 'editor'
                                ? "text-gray-900 border-b-2 border-gray-500"
                                : "text-gray-500 border-b-2 border-transparent hover:text-gray-700"
                            )}
                          >
                            <Code2 className="w-4 h-4 stroke-[1.5] text-emerald-600" />
                            <span className="text-[13px] font-semibold">Code Editor</span>
                          </button>
                        )}
                        {(isBuilder || isDebugger || isOptimiser) && (
                          <button
                            onClick={() => setActiveTab('whiteboard')}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all relative",
                              activeTab === 'whiteboard' || isOptimiser
                                ? "text-gray-900 border-b-2 border-gray-500"
                                : "text-gray-500 border-b-2 border-transparent hover:text-gray-700"
                            )}
                          >
                            <PenTool className="w-4 h-4 stroke-[1.5] text-indigo-600" />
                            <span className="text-[13px] font-semibold">System Logic</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden bg-white">
                      {(activeTab === 'editor' && !isOptimiser) ? (
                        <ResizablePanelGroup orientation="vertical" className="h-full">
                          {/* Main Editor Section */}
                          <ResizablePanel defaultSize={isDebugger ? 70 : 100} minSize={30}>
                            <EditorPanel hideToolbar={isBuilder} />
                          </ResizablePanel>

                          {/* Debugger-specific Results Container */}
                          {isDebugger && (
                            <>
                              <ResizableHandle withHandle horizontal className="bg-transparent h-1 hover:bg-indigo-500/10 transition-colors" />
                              <ResizablePanel defaultSize={30} minSize={10} className="bg-white border-t border-gray-100">
                                <ResultsPanel />
                              </ResizablePanel>
                            </>
                          )}
                        </ResizablePanelGroup>
                      ) : (
                        <div className="h-full w-full">
                          <WhiteboardProvider roomId={roomId} socket={socket} isArchitect={isArchitect}>
                            <CanvasBoard isArchitect={isArchitect} />
                          </WhiteboardProvider>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ChatPanel />
                )}
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </main>
    </div>
  );
}

export default function CodeEditorPage() {
  return (
    <ProblemPanelProvider>
      <ResultsPanelProvider>
        <ChatPanelProvider>
          <CodeEditorContent />
        </ChatPanelProvider>
      </ResultsPanelProvider>
    </ProblemPanelProvider>
  );
}
