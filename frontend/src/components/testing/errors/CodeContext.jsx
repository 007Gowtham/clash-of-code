import React from 'react';

export default function CodeContext({ code, line, column, message }) {
    if (!code || !line) return null;

    const lines = code.split('\n');
    const lineIdx = line - 1; // 0-based index

    // Show context: 2 lines before, error line, 2 lines after
    const startIdx = Math.max(0, lineIdx - 2);
    const endIdx = Math.min(lines.length - 1, lineIdx + 2);

    const contextLines = [];
    for (let i = startIdx; i <= endIdx; i++) {
        contextLines.push({
            num: i + 1,
            content: lines[i],
            isError: i === lineIdx
        });
    }

    return (
        <div className="bg-gray-50 rounded border border-gray-300 font-mono text-sm overflow-hidden">
            <div className="bg-gray-100 px-3 py-1 border-b border-gray-200 text-xs font-semibold text-gray-500">
                Line {line}
            </div>
            <div className="p-2 overflow-x-auto">
                {contextLines.map((l) => (
                    <div
                        key={l.num}
                        className={`flex ${l.isError ? 'bg-red-100 -mx-2 px-2 py-1' : 'py-0.5'}`}
                    >
                        <span className="w-8 text-right text-gray-400 select-none mr-4 text-xs">
                            {l.num}
                        </span>
                        <div className="flex-1 whitespace-pre relative">
                            <span className={l.isError ? 'text-red-900 font-medium' : 'text-gray-800'}>
                                {l.content || ' '}
                            </span>
                            {/* Pointer for column if available */}
                            {l.isError && column && (
                                <div className="text-red-600 font-bold leading-none mt-0.5">
                                    {' '.repeat(Math.max(0, column - 1))}^
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {message && (
                <div className="bg-red-50 px-3 py-1.5 border-t border-red-100 text-xs text-red-700 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                    {message}
                </div>
            )}
        </div>
    );
}
