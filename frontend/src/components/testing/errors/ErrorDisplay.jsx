import React, { useState } from 'react';
import { AlertTriangle, XCircle, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import CodeContext from './CodeContext';

export default function ErrorDisplay({ error, code, language, onApplyFix }) {
    const [expanded, setExpanded] = useState(true);

    if (!error) return null;

    // Determine color scheme based on error type
    const isCompilation = error.type === 'COMPILATION_ERROR';
    const borderColor = isCompilation ? 'border-orange-200' : 'border-red-200';
    const bgColor = isCompilation ? 'bg-orange-50' : 'bg-red-50';
    const iconColor = isCompilation ? 'text-orange-600' : 'text-red-600';
    const titleColor = isCompilation ? 'text-orange-900' : 'text-red-900';

    const copyError = () => {
        navigator.clipboard.writeText(error.raw || error.message);
    };

    return (
        <div className={`rounded-lg border-2 ${borderColor} ${bgColor} overflow-hidden mb-4 transition-all`}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {isCompilation ? (
                        <AlertTriangle className={iconColor} size={24} />
                    ) : (
                        <XCircle className={iconColor} size={24} />
                    )}
                    <div>
                        <h3 className={`font-bold text-lg ${titleColor}`}>
                            {isCompilation ? 'Compilation Failed' : 'Runtime Error'}
                        </h3>
                        <p className={`text-sm font-medium ${titleColor} opacity-90`}>
                            {error.message || 'An error occurred during execution'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? <ChevronDown size={20} className={titleColor} /> : <ChevronRight size={20} className={titleColor} />}
                </div>
            </div>

            {/* Detailed Content */}
            {expanded && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Code Context Visualization */}
                    {error.line && (
                        <div className="mb-4">
                            <CodeContext
                                code={code}
                                line={error.line}
                                column={error.column}
                                message={error.message}
                            />
                        </div>
                    )}

                    {/* Suggestions */}
                    {error.suggestion && error.suggestion.length > 0 && (
                        <div className="mb-4 bg-white rounded border border-gray-200 p-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                💡 Suggestions to fix this:
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                                {error.suggestion.map((sugg, idx) => (
                                    <li key={idx} className="text-sm text-gray-600">
                                        {sugg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Raw Error Log */}
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Raw Error Log
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); copyError(); }}
                                className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                            >
                                <Copy size={12} /> Copy
                            </button>
                        </div>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto font-mono whitespace-pre-wrap max-h-40">
                            {error.raw || error.message}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
