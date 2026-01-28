'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Play, Send, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ErrorDisplay from '@/components/testing/errors/ErrorDisplay';
import api from '@/lib/api';

export default function TestingPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Question state
    const [question, setQuestion] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    // Editor state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');

    // Execution state
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeTab, setActiveTab] = useState('description'); // description, testcases, submissions

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
        setLoading(false);
        fetchQuestions();
    }, [router]);

    // Fetch all questions
    const fetchQuestions = async () => {
        try {
            const response = await api.get('/testing/questions');
            const data = response.data;
            setQuestions(data.data.questions || []);
            if (data.data.questions?.length > 0) {
                loadQuestion(data.data.questions[0].id);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            // Error handled by api.js interceptor
        }
    };

    // Load a specific question
    const loadQuestion = async (questionId) => {
        try {
            const response = await api.get(`/testing/questions/${questionId}`);
            const data = response.data;
            setQuestion(data.data);
            setSelectedQuestionId(questionId);

            // Load template code for current language
            loadTemplateCode(data.data, language);

            setRunResult(null);
            setSubmitResult(null);
        } catch (error) {
            console.error('Error loading question:', error);
            // Error handled by api.js interceptor
        }
    };

    // Load template code from question templates
    const loadTemplateCode = (questionData, lang) => {
        if (!questionData) return;

        const template = questionData.templates?.[lang];
        if (template && template.userFunction) {
            // Use the userFunction from templates
            setCode(template.userFunction);
        } else {
            // Fallback to empty template if no userFunction found
            setCode(getDefaultCode(lang));
        }
    };

    // Fallback default code templates (used only if templates not available)
    const getDefaultCode = (lang) => {
        const templates = {
            python: '# Write your solution here\ndef solution():\n    pass\n\n',
            javascript: '// Write your solution here\nfunction solution() {\n    \n}\n\n',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
            java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
            c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n'
        };
        return templates[lang] || '';
    };

    // Run code
    const handleRun = async () => {
        if (!question) {
            toast.error('Please select a question first');
            return;
        }

        setIsRunning(true);
        setRunResult(null);

        try {
            const response = await api.post(`/testing/run/${question.id}`, {
                code,
                language
            });

            const data = response.data;
            setRunResult(data.data);
            toast.success(`${data.data.testsPassed}/${data.data.totalTests} test cases passed`);
        } catch (error) {
            console.error('Run error:', error);
            // Error handled by api.js
        } finally {
            setIsRunning(false);
        }
    };

    // Submit code
    const handleSubmit = async () => {
        if (!question) {
            toast.error('Please select a question first');
            return;
        }

        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const response = await api.post(`/testing/submit/${question.id}`, {
                code,
                language
            });

            const data = response.data;
            setSubmitResult(data.data);

            if (data.data.verdict === 'ACCEPTED') {
                toast.success(`🎉 Accepted! Runtime: ${data.data.executionTime?.toFixed(2)}ms`);
            } else {
                toast.error(`${data.data.verdict}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            // Error handled by api.js
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">Code Testing</h1>
                        {question && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${question.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {question.difficulty}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => {
                                const newLang = e.target.value;
                                setLanguage(newLang);
                                // Load template for new language
                                if (question) {
                                    loadTemplateCode(question, newLang);
                                } else {
                                    setCode(getDefaultCode(newLang));
                                }
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="c">C</option>
                        </select>
                        <button
                            onClick={handleRun}
                            disabled={isRunning || !question}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Play size={16} />
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !question}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto p-4">
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
                    {/* Question List Sidebar */}
                    <div className="col-span-2 bg-white rounded-lg border border-gray-200 overflow-y-auto">
                        <div className="p-3 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900">Problems</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {questions.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => loadQuestion(q.id)}
                                    className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${selectedQuestionId === q.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                        }`}
                                >
                                    <div className="font-medium text-sm text-gray-900 truncate">{q.title}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs ${q.difficulty === 'EASY' ? 'text-green-600' :
                                            q.difficulty === 'MEDIUM' ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                        <span className="text-xs text-gray-500">•</span>
                                        <span className="text-xs text-gray-500">{q.points} pts</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Description */}
                    <div className="col-span-5 bg-white rounded-lg border border-gray-200 overflow-y-auto">
                        {question ? (
                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

                                {/* Tabs */}
                                <div className="flex gap-4 border-b border-gray-200 mb-4">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'description'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Description
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('testcases')}
                                        className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'testcases'
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Test Cases
                                    </button>
                                </div>

                                {/* Description Tab */}
                                {activeTab === 'description' && (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{question.description}</p>
                                        </div>

                                        {question.testCases?.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-3">Examples:</h3>
                                                {question.testCases.map((tc, idx) => (
                                                    <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                                        <div className="mb-2">
                                                            <span className="font-medium text-gray-700">Input:</span>
                                                            <pre className="mt-1 text-sm text-gray-800 font-mono">{tc.input}</pre>
                                                        </div>
                                                        <div className="mb-2">
                                                            <span className="font-medium text-gray-700">Output:</span>
                                                            <pre className="mt-1 text-sm text-gray-800 font-mono">{tc.output}</pre>
                                                        </div>
                                                        {tc.explanation && (
                                                            <div>
                                                                <span className="font-medium text-gray-700">Explanation:</span>
                                                                <p className="mt-1 text-sm text-gray-600">{tc.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {question.constraints?.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-3">Constraints:</h3>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {question.constraints.map((constraint, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700">{constraint}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {question.hints?.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-3">Hints:</h3>
                                                <div className="space-y-2">
                                                    {question.hints.map((hint, idx) => (
                                                        <details key={idx} className="p-3 bg-blue-50 rounded-lg">
                                                            <summary className="cursor-pointer text-sm font-medium text-blue-900">
                                                                Hint {idx + 1}
                                                            </summary>
                                                            <p className="mt-2 text-sm text-blue-800">{hint}</p>
                                                        </details>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Test Cases Tab */}
                                {activeTab === 'testcases' && (
                                    <div className="space-y-4">
                                        {runResult?.results?.map((result, idx) => (
                                            <div key={idx} className={`p-4 rounded-lg border-2 ${result.status === 'PASSED' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">Test Case {idx + 1}</span>
                                                    <span className={`flex items-center gap-1 text-sm font-medium ${result.status === 'PASSED' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                        {result.status === 'PASSED' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                        {result.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Input:</span>
                                                        <pre className="mt-1 p-2 bg-white rounded text-xs">{result.input}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Expected:</span>
                                                        <pre className="mt-1 p-2 bg-white rounded text-xs">{result.expectedOutput}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Your Output:</span>
                                                        <pre className="mt-1 p-2 bg-white rounded text-xs">{result.actualOutput === '' ? <span className="text-gray-400 italic">(Empty)</span> : (result.actualOutput || 'N/A')}</pre>
                                                    </div>
                                                    {result.error && (
                                                        <div>
                                                            <span className="font-medium text-red-700">Error:</span>
                                                            <pre className="mt-1 p-2 bg-white rounded text-xs text-red-600">{result.error}</pre>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-4 text-xs text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {result.executionTime?.toFixed(2)}ms
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Database size={12} />
                                                            {result.memory?.toFixed(2)}MB
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a question to get started
                            </div>
                        )}
                    </div>

                    {/* Code Editor */}
                    <div className="col-span-5 bg-white rounded-lg border border-gray-200 flex flex-col">
                        <div className="flex-1 overflow-hidden">
                            <Editor
                                key={language} // Force remount on language change to prevent state issues
                                height="100%"
                                language={language === 'cpp' ? 'cpp' : language}
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                }}
                            />
                        </div>

                        {/* Results Panel */}
                        {(runResult || submitResult) && (
                            <div className="border-t border-gray-200 p-4 max-h-64 overflow-y-auto bg-gray-50">
                                {/* Submit Result */}
                                {submitResult && (
                                    <div className={`p-4 rounded-lg mb-4 border-2 ${submitResult.verdict === 'ACCEPTED'
                                        ? 'bg-green-50 border-green-300'
                                        : submitResult.verdict === 'COMPILATION_ERROR'
                                            ? 'bg-orange-50 border-orange-300'
                                            : submitResult.verdict === 'RUNTIME_ERROR'
                                                ? 'bg-purple-50 border-purple-300'
                                                : submitResult.verdict === 'TIME_LIMIT_EXCEEDED'
                                                    ? 'bg-yellow-50 border-yellow-300'
                                                    : 'bg-red-50 border-red-300'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {submitResult.verdict === 'ACCEPTED' ? (
                                                    <CheckCircle className="text-green-600" size={20} />
                                                ) : (
                                                    <XCircle className="text-red-600" size={20} />
                                                )}
                                                <span className={`font-bold text-lg ${submitResult.verdict === 'ACCEPTED' ? 'text-green-900' :
                                                    submitResult.verdict === 'COMPILATION_ERROR' ? 'text-orange-900' :
                                                        submitResult.verdict === 'RUNTIME_ERROR' ? 'text-purple-900' :
                                                            'text-red-900'
                                                    }`}>
                                                    {submitResult.verdict.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            {submitResult.verdict === 'ACCEPTED' && (
                                                <div className="flex gap-4 text-sm text-green-800">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {submitResult.executionTime?.toFixed(2)}ms
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Database size={14} />
                                                        {submitResult.memory?.toFixed(2)}MB
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Success Message */}
                                        {submitResult.verdict === 'ACCEPTED' && (
                                            <div className="space-y-1">
                                                <p className="text-sm text-green-800 font-medium">
                                                    ✅ All test cases passed! ({submitResult.testsPassed}/{submitResult.totalTests})
                                                </p>
                                                <p className="text-xs text-green-700">
                                                    Points earned: {submitResult.points}
                                                </p>
                                            </div>
                                        )}

                                        {/* Compilation Error */}
                                        {/* Compilation Error */}
                                        {submitResult.verdict === 'COMPILATION_ERROR' && (
                                            <div className="mt-3">
                                                <ErrorDisplay
                                                    error={submitResult.results?.[0]?.parsedError || {
                                                        type: 'COMPILATION_ERROR',
                                                        message: submitResult.results?.[0]?.error || 'Compilation failed',
                                                        raw: submitResult.results?.[0]?.error
                                                    }}
                                                    code={code}
                                                    language={language}
                                                    onApplyFix={(fixed) => setCode(fixed)}
                                                />
                                            </div>
                                        )}

                                        {/* Runtime Error */}
                                        {submitResult.verdict === 'RUNTIME_ERROR' && (
                                            <div className="mt-3">
                                                <ErrorDisplay
                                                    error={submitResult.results?.[0]?.parsedError || {
                                                        type: 'RUNTIME_ERROR',
                                                        message: submitResult.results?.[0]?.error || 'Runtime error occurred',
                                                        raw: submitResult.results?.[0]?.error
                                                    }}
                                                    code={code}
                                                    language={language}
                                                />
                                            </div>
                                        )}

                                        {/* Time Limit Exceeded */}
                                        {submitResult.verdict === 'TIME_LIMIT_EXCEEDED' && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-sm font-medium text-yellow-900">
                                                    ⏱️ Time Limit Exceeded
                                                </p>
                                                <p className="text-xs text-yellow-800">
                                                    Your code took too long to execute. Try optimizing your algorithm.
                                                </p>
                                                <p className="text-xs text-yellow-700">
                                                    💡 Tip: Consider using more efficient data structures or algorithms
                                                </p>
                                            </div>
                                        )}

                                        {/* Wrong Answer */}
                                        {submitResult.verdict === 'WRONG_ANSWER' && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-sm font-medium text-red-900">
                                                    ❌ Wrong Answer
                                                </p>
                                                <p className="text-xs text-red-800">
                                                    {submitResult.testsPassed}/{submitResult.totalTests} test cases passed
                                                </p>
                                                <button
                                                    onClick={() => setActiveTab('testcases')}
                                                    className="text-xs text-red-700 hover:text-red-800 underline"
                                                >
                                                    View failed test cases →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Run Result */}
                                {runResult && (
                                    <div>
                                        {/* Error Summary for Run */}
                                        {runResult.verdict !== 'ACCEPTED' && runResult.results?.[0]?.error && (
                                            <div className="mb-3">
                                                <ErrorDisplay
                                                    error={runResult.results[0].parsedError || {
                                                        type: runResult.results[0].status === 'COMPILATION_ERROR' ? 'COMPILATION_ERROR' : 'RUNTIME_ERROR',
                                                        message: runResult.results[0].error,
                                                        raw: runResult.results[0].error
                                                    }}
                                                    code={code}
                                                    language={language}
                                                />
                                            </div>
                                        )}

                                        {/* Test Results Summary */}
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${runResult.verdict === 'ACCEPTED' ? 'text-green-900' : 'text-red-900'
                                                }`}>
                                                {runResult.verdict === 'ACCEPTED' ? '✅' : '❌'} Test Results: {runResult.testsPassed}/{runResult.totalTests} passed
                                            </span>
                                            <button
                                                onClick={() => setActiveTab('testcases')}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View Details →
                                            </button>
                                        </div>

                                        {/* Quick Preview of Failed Test */}
                                        {runResult.verdict !== 'ACCEPTED' && runResult.results?.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                <span className="font-medium">First failure:</span> Test Case {runResult.results.findIndex(r => r.status !== 'PASSED') + 1}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
