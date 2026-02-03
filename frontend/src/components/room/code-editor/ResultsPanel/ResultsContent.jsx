'use client';

import { cn } from "@/lib/utils";
import {
    Check,
    Heart,
    X
} from 'lucide-react';
import { useState } from 'react';

const TestcaseView = ({ cases, activeCase, onCaseChange }) => {
    const currentCase = cases.find(c => c.id === activeCase) || cases[0];

    return (
        <div className="space-y-6">
            {/* Case Tabs */}
            <div className="flex items-center space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                {cases.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => onCaseChange(c.id)}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                            activeCase === c.id
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        <span className="text-sm font-medium">{c.label}</span>
                    </button>
                ))}
            </div>

            {/* Input Section */}
            <div className="space-y-4">
                {currentCase.inputs.map((input, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{input.name} =</div>
                        <div className="bg-gray-100/60 rounded-lg p-3 md:p-4 border border-transparent">
                            <div className="font-mono text-sm text-gray-900">{input.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TestResultView = ({ cases, activeCase, onCaseChange }) => {
    const currentCase = cases.find(c => c.id === activeCase) || cases[0];

    return (
        <>
            {/* Status Result */}
            <div className="flex items-baseline justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h1 className={cn(
                        "text-2xl font-semibold tracking-tight",
                        currentCase.passed ? "text-green-500" : "text-red-500"
                    )}>
                        {currentCase.passed ? "Accepted" : "Wrong Answer"}
                    </h1>
                    <span className="text-sm text-gray-400 font-normal mt-1">Runtime: 0 ms</span>
                </div>
                <a href="#" className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">Diff</a>
            </div>

            {/* Case Tabs with Status Icons */}
            <div className="flex items-center space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                {cases.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => onCaseChange(c.id)}
                        className={cn(
                            "flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap",
                            activeCase === c.id
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        <div className={cn(
                            "rounded-[3px] w-3.5 h-3.5 flex items-center justify-center",
                            c.passed ? "bg-green-500" : "bg-red-500"
                        )}>
                            {c.passed ? (
                                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            ) : (
                                <X className="w-2.5 h-2.5 text-white stroke-[3]" />
                            )}
                        </div>
                        <span className="text-sm font-medium">{c.label}</span>
                    </button>
                ))}
            </div>

            {/* Inputs / Outputs Area */}
            <div className="space-y-6">
                {/* Input Section */}
                <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Input</div>
                    <div className="space-y-3">
                        {currentCase.inputs.map((input, idx) => (
                            <div key={idx} className="bg-gray-50/80 rounded-lg p-3 md:p-4 border border-transparent">
                                <div className="text-sm text-gray-400 mb-1.5 font-mono">{input.name} =</div>
                                <div className="font-mono text-base text-gray-900">{input.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Output Section */}
                <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Output</div>
                    <div className="bg-gray-50/80 rounded-lg p-3 md:p-4 border border-transparent">
                        <div className="font-mono text-base text-gray-900">
                            {currentCase.passed ? (
                                currentCase.output
                            ) : (
                                <span className="text-red-500">{currentCase.output}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expected Section */}
                <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Expected</div>
                    <div className="bg-gray-50/80 rounded-lg p-3 md:p-4 border border-transparent">
                        <div className="font-mono text-base text-gray-900">
                            {currentCase.expected}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const ResultsContent = ({ activeView }) => {
    const [activeCase, setActiveCase] = useState(1);

    // Template array for the cases (temporary data)
    const [cases] = useState([
        {
            id: 1,
            label: 'Case 1',
            passed: false,
            inputs: [
                { name: 'head', value: '[1]' },
                { name: 'n', value: '1' }
            ],
            output: '[1]',
            expected: '[]'
        },
        {
            id: 2,
            label: 'Case 2',
            passed: false,
            inputs: [
                { name: 'head', value: '[1,2]' },
                { name: 'n', value: '1' }
            ],
            output: '[2]',
            expected: '[1]'
        },
        {
            id: 3,
            label: 'Case 3',
            passed: true,
            inputs: [
                { name: 'head', value: '[1,2,3]' },
                { name: 'n', value: '1' }
            ],
            output: '[1,2]',
            expected: '[1,2]'
        }
    ]);

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
            <div className="max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8 overflow-y-auto no-scrollbar">

                {activeView === 'testcase' ? (
                    <TestcaseView
                        cases={cases}
                        activeCase={activeCase}
                        onCaseChange={setActiveCase}
                    />
                ) : (
                    <TestResultView
                        cases={cases}
                        activeCase={activeCase}
                        onCaseChange={setActiveCase}
                    />
                )}

                {/* Footer */}
                <div className="mt-10 mb-4 flex items-center justify-center space-x-2 text-gray-400 group cursor-pointer border-t border-gray-50 pt-6">
                    <Heart className="w-4 h-4 group-hover:text-gray-600 transition-colors stroke-[1.5]" />
                    <span className="text-sm group-hover:text-gray-600 transition-colors font-medium">Contribute a testcase</span>
                </div>
            </div>
        </div>
    );
};
