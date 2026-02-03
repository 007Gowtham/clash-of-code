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
import { ChatPanelProvider, useChatPanel } from '@/contexts/ChatPanelContext';
import { ProblemPanelProvider, useProblemPanel } from '@/contexts/ProblemPanelContext';
import { ResultsPanelProvider, useResultsPanel } from '@/contexts/ResultsPanelContext';
import { Code2, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef } from 'react';

function CodeEditorContent() {
  const params = useParams();

  const resizeStartedRef = useRef(0);

  const { id: roomId, teamId } = params;
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

          <ResizableHandle withHandle className="bg-transparent w-1 hover:bg-indigo-500/10 transition-colors" />

          {/* 2. Middle Panel: Code & Results Container */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup orientation="vertical" className="gap-1 h-full">

              {/* Top: Code Editor Container */}
              <ResizablePanel
                defaultSize={100 - resultsPanelSize}
                minSize={30}
                className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
              >
                <EditorPanel />
              </ResizablePanel>

              <ResizableHandle withHandle horizontal className="bg-transparent h-1 hover:bg-indigo-500/10 transition-colors" />

              {/* Bottom: Test Result Container */}
              <ResizablePanel
                key={`results-${resultsPanelSize}`}
                defaultSize={resultsPanelSize}
                minSize={5}
                collapsible={true}
                onResize={(size) => {

                }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
              >
                <ResultsPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-transparent w-1 hover:bg-indigo-500/10 transition-colors" />

          {/* 3. Right Panel: Team Chat Container */}
          <ResizablePanel
            key={`chat-${chatPanelSize}`}
            defaultSize={chatPanelSize}
            minSize={5}
            collapsible={true}
            onResize={(size) => {

            }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"
          >
            <ChatPanel />
          </ResizablePanel>

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
