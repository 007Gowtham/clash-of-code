'use client';

import { AlertCircle, CheckCircle, ChevronDown, Clock, Code2, Loader2, Play, RotateCcw, TerminalSquare, Trash2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Group, Panel, Separator } from "react-resizable-panels";



import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import CanvasBoard from '../../Whiteboard/CanvasBoard';
import { WhiteboardProvider } from '../../Whiteboard/WhiteboardContext';

// Dynamically import Monaco Editor (client-side only)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CodeEditorPanel({
  code,
  headerCode,

  boilerplate,
  definition,
  setCode,
  activeEditor,
  onEditorChange,
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  onResetCode,
  isLocked,
  selectedQuestion,
  isRunning,
  isSubmitting,
  output,
  submissionResult,
  teamMembers = [],
  currentUserId,
  leaderId,
  lockMessage,
  timeLeft = { minutes: 0, seconds: 0 },
  style
}) {
  const { id: roomId } = useParams();
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const editorRef = useRef(null);
  const tabRefs = useRef({});
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: '0.25rem', width: '0px' });
  const [showContext, setShowContext] = useState(false);

  // Debounce timer ref for onChange
  const debounceTimerRef = useRef(null);

  // Drawer State
  const [drawer, setDrawer] = useState({ isOpen: false, mode: 'run' });

  // Selected test case for viewing details
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // Update drawer when running/submitting changes
  useEffect(() => {
    if (isRunning) {
      setDrawer({ isOpen: true, mode: 'run' });
      setSelectedTestCaseIndex(0); // Reset to first test case
    } else if (output) {
      setDrawer({ isOpen: true, mode: 'run' });
    }
  }, [isRunning, output]);

  useEffect(() => {
    if (isSubmitting) {
      setDrawer({ isOpen: true, mode: 'submit' });
    } else if (submissionResult) {
      setDrawer({ isOpen: true, mode: 'submit' });
    }
  }, [isSubmitting, submissionResult]);

  // Socket connection for Whiteboard
  useEffect(() => {
    if (showWhiteboard && !socket) {
      // Connect to backend socket
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');
      setSocket(newSocket);

      return () => {
        // Optional: disconnect on unmount or toggle
        // newSocket.disconnect();
      };
    }
  }, [showWhiteboard, socket]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleRunClick = () => {
    // Get the latest code directly from Monaco editor
    const currentCode = editorRef.current?.getValue() || code;
    if (onRun) onRun(currentCode);
  };

  const handleSubmitClick = () => {
    // Get the latest code directly from Monaco editor
    const currentCode = editorRef.current?.getValue() || code;
    if (onSubmit) onSubmit(currentCode);
  };

  const closeDrawer = () => {
    setDrawer(prev => ({ ...prev, isOpen: false }));
  };

  const isLoading = isRunning || isSubmitting;

  const languages = [
    {
      label: 'Python',
      value: 'python',
      disabled: false,
      tooltip: 'Fully supported'
    },
    {
      label: 'JavaScript',
      value: 'javascript',
      disabled: false,
      tooltip: 'Fully supported'
    },
    {
      label: 'Java',
      value: 'java',
      disabled: false,
      tooltip: 'Supported'
    },
    {
      label: 'C++',
      value: 'cpp',
      disabled: false,
      tooltip: 'Supported'
    },
  ];

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure Monaco theme with black/white/blue
    monaco.editor.defineTheme('custom-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '2563eb', fontStyle: 'bold' }, // Blue
        { token: 'string', foreground: '000000', fontStyle: 'normal' }, // Black
        { token: 'number', foreground: '000000', fontStyle: 'normal' }, // Black
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' }, // Gray
        { token: 'variable', foreground: '2563eb', fontStyle: 'normal' }, // Blue
        { token: 'function', foreground: '2563eb', fontStyle: 'normal' }, // Blue
      ],
      colors: {
        'editor.background': '#ffffff', // White
        'editor.foreground': '#000000', // Black
        'editorLineNumber.foreground': '#9ca3af', // Gray
        'editorLineNumber.activeForeground': '#2563eb', // Blue
      },
    });

    monaco.editor.setTheme('custom-theme');
  };

  // Auto-switch to Python if current language is disabled for this problem
  useEffect(() => {
    const currentLang = languages.find(l => l.value === language);
    if (currentLang?.disabled) {
      // Switch to Python (first non-disabled language)
      onLanguageChange('python');
    }
  }, [selectedQuestion?.title, language]);

  const currentLanguage = languages.find(l => l.value === language) || languages[0];

  return (
    <div className="flex-1 flex flex-col bg-white relative" style={style}>
      {/* Editor Header - LeetCode Style */}
      <div className="h-10 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
            <Code2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Code</span>
          </div>

          <button
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showWhiteboard
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
          >
            {showWhiteboard ? 'Show Editor' : 'Whiteboard'}
          </button>

          <div className="w-px h-3 bg-gray-300"></div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              {currentLanguage.label}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showLanguageMenu && (
              <div className="absolute top-full mt-1 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      if (!lang.disabled) {
                        onLanguageChange(lang.value);
                        setShowLanguageMenu(false);
                      }
                    }}
                    disabled={lang.disabled}
                    title={lang.tooltip}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 ${lang.disabled
                      ? 'text-gray-400 cursor-not-allowed opacity-50'
                      : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${lang.value === language ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Context Toggle */}
          {(headerCode || boilerplate || definition) && (
            <button
              onClick={() => setShowContext(!showContext)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${showContext
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'bg-gray-100/50 text-gray-500 hover:text-gray-700'
                }`}
            >
              {showContext ? <ChevronDown className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
              <span>{showContext ? 'Hide Context' : 'Show Context'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100/50 rounded-md border border-gray-200/50">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className={`font-mono font-bold text-xs ${timeLeft.minutes < 5 ? 'text-red-500' : 'text-gray-700'}`}>
              {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Code Area & Console - Nested Vertical Resizable */
        showWhiteboard ? (
          <div className="flex-1 relative z-0">
            <WhiteboardProvider
              roomId={roomId || 'default-room'}
              socket={socket}
              isArchitect={currentUserId === leaderId}
            >
              <CanvasBoard />
            </WhiteboardProvider>
          </div>
        ) : (
          <>
            <Group orientation="vertical" className="flex-1">
              {/* Monaco Editor Panel */}
              <Panel defaultSize={70} minSize={20} className="relative flex flex-col">
                {/* Reset Confirmation Modal */}
                {showResetConfirm && (
                  <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Reset Code?</h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            This will discard all your current changes.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (onResetCode) onResetCode();
                            setShowResetConfirm(false);
                          }}
                          className="flex-1 px-3 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                        >
                          Confirm Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <MonacoEditor
                    height="100%"
                    language={language}
                    value={code || ''}
                    onChange={(value) => {
                      if (setCode && value !== undefined) {
                        setCode(value);
                      }
                    }}
                    onMount={handleEditorDidMount}
                    theme="custom-theme"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </Panel>

              <Separator className="h-1 bg-gray-100/50 hover:bg-blue-500/30 transition-colors cursor-row-resize" />

              {/* Output/Console Panel - Vertical Resize */}
              <Panel
                defaultSize={30}
                minSize={10}
                collapsible={true}
                onCollapse={() => closeDrawer()}
                className={`flex flex-col bg-white border-t border-gray-200 relative ${drawer.isOpen ? 'block' : 'hidden'}`}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    {/* Run Mode Tabs */}
                    {drawer.mode === 'run' ? (
                      <div className="flex bg-gray-100/50 p-1 rounded-lg">
                        <button
                          onClick={() => setDrawer(prev => ({ ...prev, tab: 'tests' }))}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${drawer.tab !== 'console'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                          Test Cases
                        </button>
                        <button
                          onClick={() => setDrawer(prev => ({ ...prev, tab: 'console' }))}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${drawer.tab === 'console'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                          <TerminalSquare className="w-3 h-3" />
                          Console
                        </button>
                      </div>
                    ) : (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${drawer.mode === 'run' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                        {isLoading ? (drawer.mode === 'run' ? 'Running Code...' : 'Submitting Solution...') : (drawer.mode === 'run' ? '' : 'Submission Result')}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isLoading && (
                      <>
                        <button
                          onClick={handleRunClick}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                          title="Run Code"
                        >
                          <Play className="w-3.5 h-3.5 fill-gray-400 text-gray-400 group-hover:fill-gray-600 group-hover:text-gray-600 transition-colors" />
                          Run
                        </button>
                        <button
                          onClick={handleSubmitClick}
                          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-sm shadow-gray-900/20 active:translate-y-px"
                          title="Submit Solution"
                        >
                          <AlertCircle className="w-3.5 h-3.5 rotate-180" />
                          Submit
                        </button>
                      </>
                    )}
                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                    <button onClick={closeDrawer} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Running your code...</p>
                        <p className="text-xs text-gray-500 mt-1">Checking against test cases</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      {drawer.mode === 'run' ? (
                        <>
                          {drawer.tab === 'console' ? (
                            <div className="h-full font-mono text-xs p-4 bg-gray-900 text-gray-300 rounded-lg overflow-auto whitespace-pre-wrap">
                              {output?.consoleOutput || '// No console output produced.\n// Use print() or cout statements to debug your code.'}
                            </div>
                          ) : (
                            <div className="flex h-full gap-6">
                              {/* Left: Test Case List */}
                              <div className="w-48 flex-shrink-0 border-r border-gray-100 pr-4 space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Test Cases</h4>
                                <div className="space-y-1.5">
                                  {(output?.results || []).map((test, index) => (
                                    <button
                                      key={test.testCaseId || index}
                                      onClick={() => setSelectedTestCaseIndex(index)}
                                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border ${selectedTestCaseIndex === index
                                        ? test.status === 'PASSED'
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-md'
                                          : 'bg-rose-50 border-rose-300 text-rose-700 shadow-md'
                                        : test.status === 'PASSED'
                                          ? 'bg-white border-emerald-200 text-emerald-700 shadow-sm hover:bg-emerald-50'
                                          : 'bg-white border-rose-200 text-rose-700 shadow-sm hover:bg-rose-50'
                                        }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        Case {index + 1}
                                      </span>
                                      {test.status === 'PASSED' ? (
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      ) : (
                                        <AlertCircle className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Right: Detailed Output */}
                              <div className="flex-1 pl-4 overflow-y-auto">
                                {output?.results && output.results.length > 0 ? (
                                  <div className="bg-white border border-gray-200 rounded-xl p-0 h-full overflow-hidden shadow-sm flex flex-col">
                                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Case {selectedTestCaseIndex + 1}</span>
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${output.results[selectedTestCaseIndex]?.status === 'PASSED'
                                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                        : 'text-rose-600 bg-rose-50 border-rose-100'
                                        }`}>
                                        {output.results[selectedTestCaseIndex]?.status || 'Error'}
                                      </span>
                                    </div>

                                    <div className="p-4 space-y-5 font-mono text-sm overflow-y-auto">
                                      {output.results[selectedTestCaseIndex] && (
                                        <>
                                          <div className="space-y-1.5">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Input</h5>
                                            <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-700 text-xs whitespace-pre-wrap">
                                              {output.results[selectedTestCaseIndex].input || 'No input'}
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Output</h5>
                                              <div className={`bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs whitespace-pre-wrap ${output.results[selectedTestCaseIndex].status === 'PASSED' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                {output.results[selectedTestCaseIndex].actualOutput || 'No output'}
                                              </div>
                                            </div>
                                            <div className="space-y-1.5">
                                              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expected</h5>
                                              <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-emerald-600 text-xs whitespace-pre-wrap">
                                                {output.results[selectedTestCaseIndex].expectedOutput || 'No expected output'}
                                              </div>
                                            </div>
                                          </div>

                                          {output.results[selectedTestCaseIndex].error && (
                                            <div className="pt-4 border-t border-gray-100 space-y-1.5">
                                              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Error</h5>
                                              <div className="text-rose-600 text-xs whitespace-pre-wrap bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                                                {output.results[selectedTestCaseIndex].error}
                                              </div>
                                            </div>
                                          )}

                                          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                              <span className="text-gray-400 font-bold">Execution Time:</span>
                                              <span className="ml-2 text-gray-700">{output.results[selectedTestCaseIndex].executionTime?.toFixed(2) || 0}ms</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400 font-bold">Memory:</span>
                                              <span className="ml-2 text-gray-700">{output.results[selectedTestCaseIndex].memory?.toFixed(2) || 0}MB</span>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                    No results to display
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-500">
                          {submissionResult?.verdict === 'ACCEPTED' ? (
                            <>
                              <div className="relative mb-4 group cursor-default">
                                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/5 border border-emerald-200 relative z-10 transform group-hover:scale-105 transition-transform duration-300">
                                  <CheckCircle className="w-8 h-8 text-emerald-600 drop-shadow-sm" />
                                </div>
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Accepted!</h3>
                              <p className="text-gray-500 mb-6 text-xs font-medium">
                                {submissionResult.testsPassed}/{submissionResult.totalTests} test cases passed
                              </p>

                              <div className="flex gap-4 w-full max-w-sm justify-center">
                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-36 text-center group hover:border-emerald-200 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-default relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                                  <div className="text-[9px] text-gray-400 mb-1 font-bold uppercase tracking-widest">Runtime</div>
                                  <div className="text-xl font-black text-gray-900 mb-1.5 tracking-tight group-hover:text-emerald-600 transition-colors">
                                    {submissionResult.executionTime?.toFixed(0) || 0}
                                    <span className="text-xs font-bold text-gray-400 ml-0.5">ms</span>
                                  </div>
                                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                    Fast
                                  </div>
                                </div>

                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] w-36 text-center group hover:border-purple-200 hover:shadow-[0_4px_12px_rgba(168,85,247,0.1)] transition-all duration-300 cursor-default relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                                  <div className="text-[9px] text-gray-400 mb-1 font-bold uppercase tracking-widest">Memory</div>
                                  <div className="text-xl font-black text-gray-900 mb-1.5 tracking-tight group-hover:text-purple-600 transition-colors">
                                    {submissionResult.memory?.toFixed(1) || 0}
                                    <span className="text-xs font-bold text-gray-400 ml-0.5">MB</span>
                                  </div>
                                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                    Efficient
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="relative mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl flex items-center justify-center shadow-lg border border-rose-200">
                                  <AlertCircle className="w-8 h-8 text-rose-600" />
                                </div>
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                                {submissionResult?.verdict || 'Failed'}
                              </h3>
                              <p className="text-gray-500 mb-6 text-xs font-medium">
                                {submissionResult?.testsPassed || 0}/{submissionResult?.totalTests || 0} test cases passed
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </Group>


            {/* Bottom Editor Bar */}
            <div className="h-16 border-t border-gray-200 flex items-center justify-between px-6 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawer({ isOpen: true, mode: 'run', tab: 'console' })}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-lg transition-colors"
                  title="Console"
                >
                  <TerminalSquare className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isLocked}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reset Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Center Space - Empty now that language selector is moved */}
              <div className="flex-1"></div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunClick}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-gray-400 text-gray-400 group-hover:fill-gray-600 group-hover:text-gray-600 transition-colors" />
                  )}
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  onClick={handleSubmitClick}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all shadow-sm shadow-gray-900/20 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 rotate-180" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
