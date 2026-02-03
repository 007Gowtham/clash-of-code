'use client';

import { ChevronDown, ChevronLeft, ChevronRight, Clock, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProblemPanel({
  activeTab,
  onTabChange,
  selectedQuestion,
  onQuestionSelect,
  questions = [],
  isLeader,
  questionAssignments = {},
  pendingRequests = [],
  currentUserId,
  cooldowns = {},
  onRequestQuestion,
  onAssignQuestion,
  style
}) {
  const [expandedHints, setExpandedHints] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const toggleHint = (hintId) => {
    setExpandedHints(prev => ({
      ...prev,
      [hintId]: !prev[hintId]
    }));
  };

  const tabs = [
    { id: 'problem', label: 'Problem' },
    { id: 'testcases', label: 'Test Cases' },
    { id: 'submissions', label: 'Submissions' },
  ];

  // Update currentQuestionIndex when selectedQuestion changes
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    const index = questions.findIndex(q => q.id === selectedQuestion);
    if (index !== -1 && index !== currentQuestionIndex) {
      setCurrentQuestionIndex(index);
    }
  }, [selectedQuestion, questions, currentQuestionIndex]);

  // Timer to update cooldowns every second
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions.find(q => q.id === selectedQuestion) || questions[currentQuestionIndex];
  const assignedTo = questionAssignments[currentQuestion?.id];
  const hasPendingRequest = pendingRequests?.some(req => req.questionId === currentQuestion?.id);

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      onQuestionSelect(questions[newIndex].id);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      onQuestionSelect(questions[newIndex].id);
    }
  };

  return (
    <div className="border-r overflow-auto  custom-scrollbar border-gray-200 flex flex-col bg-white relative" style={style}>
      {/* Problem Content - Full Width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-transparent">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`font-semibold pb-3 text-sm transition-colors ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {currentQuestion && (
            <>
              {activeTab === 'problem' && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                          {currentQuestion.title}
                        </h2>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide ${currentQuestion.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
                          currentQuestion.difficulty === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {currentQuestion.difficulty}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          {currentQuestion.points} pts
                        </span>
                      </div>

                      {/* Assignment Status / Button */}
                      <div className="flex items-center gap-2">
                        {assignedTo ? (
                          <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md border border-blue-100">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span>
                              {assignedTo.userId === currentUserId
                                ? 'You are working on this'
                                : `${assignedTo.username || assignedTo.name || 'Teammate'} is working on this`}
                            </span>
                          </div>
                        ) : (
                          (() => {
                            const isPending = pendingRequests?.some(req => req.questionId === currentQuestion.id && req.requesterId === currentUserId);
                            const cooldown = cooldowns?.[currentQuestion.id];
                            const remaining = cooldown ? Math.max(0, Math.ceil((cooldown - now) / 1000)) : 0;

                            if (isPending) {
                              return (
                                <button
                                  disabled
                                  className="text-xs font-bold bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-md cursor-not-allowed flex items-center gap-1.5 border border-yellow-200"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                                  Pending Approval...
                                </button>
                              );
                            }

                            if (cooldown && remaining > 0) {
                              return (
                                <button
                                  disabled
                                  className="text-xs font-bold bg-red-50 text-red-400 px-3 py-1.5 rounded-md cursor-not-allowed flex items-center gap-1.5 border border-red-100"
                                >
                                  <Clock className="w-3 h-3" />
                                  Wait {remaining}s
                                </button>
                              );
                            }

                            return (
                              <button
                                onClick={() => {
                                  if (isLeader) {
                                    onAssignQuestion(currentQuestion.id, currentUserId);
                                  } else {
                                    onRequestQuestion(currentQuestion.id, currentQuestion.title);
                                  }
                                }}
                                className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors shadow-sm flex items-center gap-1.5 active:translate-y-px"
                              >
                                <span>⚡</span> {isLeader ? 'Assign to Me' : 'Request Assignment'}
                              </button>
                            );
                          })()
                        )}
                      </div>
                    </div>
                    <div className='  flex  items-center justify-between'>
                      <span className="text-xs pr-3 font-medium text-gray-400 whitespace-nowrap">
                        Problem {currentQuestionIndex + 1}/{questions.length}
                      </span>
                      <div className="flex  items-center justify-between">
                        <button
                          onClick={handlePrevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className=" rounded hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextQuestion}
                          disabled={currentQuestionIndex === questions.length - 1}
                          className=" rounded hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-50"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>


                  <div className="prose prose-sm max-w-none text-gray-600">
                    <p className="text-sm leading-snug mb-4 whitespace-pre-wrap">
                      {currentQuestion.description}
                    </p>

                    {/* Examples Section - Moved ABOVE Constraints */}
                    {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                      <>
                        <h3 className="text-gray-900 font-bold mb-4 text-sm">Examples</h3>
                        <div className="space-y-6 mb-8">
                          {currentQuestion.examples.map((ex, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                  Example {idx + 1}
                                </span>
                              </div>
                              <div className="p-4 space-y-3">
                                <div>
                                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Input
                                  </div>
                                  <div className="bg-slate-50 border border-gray-100 rounded-md p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                                    {ex.input}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Output
                                  </div>
                                  <div className="bg-slate-50 border border-gray-100 rounded-md p-3 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                                    {ex.output}
                                  </div>
                                </div>
                                {ex.explanation && (
                                  <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                      Explanation
                                    </div>
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                      {ex.explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Constraints Section - Moved BELOW Examples */}
                    {currentQuestion.constraints && currentQuestion.constraints.length > 0 && (
                      <>
                        <h3 className="text-gray-900 font-bold mb-3 text-sm">Constraints</h3>
                        <ul className="space-y-2 mb-8 list-none">
                          {currentQuestion.constraints.map((constraint, idx) => {
                            const formatConstraint = (text) => {
                              return text
                                .replace(/<=/g, '≤')
                                .replace(/>=/g, '≥')
                                .replace(/!=/g, '≠')
                                .replace(/->/g, '→')
                                .replace(/infinity/gi, '∞');
                            };

                            return (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-gray-400 mt-1">•</span>
                                <code className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 font-mono whitespace-normal break-words text-xs">
                                  {formatConstraint(constraint)}
                                </code>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}

                    {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                      <>
                        <h3 className="text-gray-900 font-bold mb-2 text-sm">Hints</h3>
                        <p className="text-sm text-gray-500 mb-4">Not sure how to solve it? Use hints!</p>

                        <div className="space-y-3 mb-10">
                          {currentQuestion.hints.map((hint, idx) => {
                            const hintNum = idx + 1;
                            const isExpanded = expandedHints[hintNum];

                            return (
                              <div key={hintNum} className="space-y-2">
                                <div
                                  onClick={() => toggleHint(hintNum)}
                                  className="border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors"
                                >
                                  <span className="text-gray-500 text-sm font-medium">Hint #{hintNum}</span>
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  />
                                </div>
                                {isExpanded && (
                                  <div className="px-4 py-3 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-gray-700">
                                    {hint}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'testcases' && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Test Cases</h2>
                    <p className="text-sm text-gray-600">
                      Sample test cases for <span className="font-semibold">{currentQuestion.title}</span>
                    </p>
                  </div>

                  {currentQuestion.examples && currentQuestion.examples.length > 0 ? (
                    <div className="space-y-4">
                      {currentQuestion.examples.map((testCase, idx) => (
                        <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <span className="font-semibold text-gray-900">Test Case {idx + 1}</span>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                              Sample
                            </span>
                          </div>

                          <div className="p-4 space-y-4 bg-white">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input</div>
                              </div>
                              <div className="bg-slate-50 border border-gray-200 rounded-lg p-3">
                                <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-words">
                                  {testCase.input}
                                </pre>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Output</div>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <pre className="font-mono text-sm text-emerald-800 whitespace-pre-wrap break-words">
                                  {testCase.output}
                                </pre>
                              </div>
                            </div>

                            {testCase.explanation && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Explanation</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-900 leading-relaxed">
                                    {testCase.explanation}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Cases Available</h3>
                      <p className="text-sm text-gray-600">
                        Test cases for this problem are not yet available.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'submissions' && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-sm text-gray-600">
                    Your submissions will appear here after you submit your solution.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
