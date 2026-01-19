/**
 * Error Categorizer
 * Separates errors into:
 * 1. Editor Errors (syntax, compilation) - Show in code editor
 * 2. Runtime Errors - Show in code editor
 * 3. Test Case Errors (validation) - Show in results panel only
 */

class ErrorCategorizer {
    /**
     * Categorize error from execution result
     * @param {Object} result - Execution result from Judge0
     * @returns {Object} Categorized error
     */
    static categorize(result) {
        const { status, verdict, error, output, compileOutput } = result;

        // SYNTAX/COMPILATION ERRORS - Show in editor
        if (status === 'COMPILATION_ERROR' || verdict === 'COMPILATION_ERROR') {
            return {
                category: 'EDITOR_ERROR',
                type: 'COMPILATION_ERROR',
                showInEditor: true,
                showInResults: false,
                title: 'Compilation Error',
                message: this.parseCompilationError(compileOutput || error),
                details: compileOutput || error,
                icon: '🔴',
                color: 'error'
            };
        }

        // RUNTIME ERRORS - Show in editor
        if (status === 'RUNTIME_ERROR' || verdict === 'RUNTIME_ERROR') {
            return {
                category: 'EDITOR_ERROR',
                type: 'RUNTIME_ERROR',
                showInEditor: true,
                showInResults: false,
                title: 'Runtime Error',
                message: this.parseRuntimeError(error),
                details: error,
                icon: '⚠️',
                color: 'warning'
            };
        }

        // TIME LIMIT EXCEEDED - Show in editor
        if (status === 'TIMEOUT' || verdict === 'TIME_LIMIT_EXCEEDED') {
            return {
                category: 'EDITOR_ERROR',
                type: 'TIME_LIMIT_EXCEEDED',
                showInEditor: true,
                showInResults: false,
                title: 'Time Limit Exceeded',
                message: 'Your code took too long to execute',
                details: 'Consider optimizing your algorithm for better time complexity',
                icon: '⏱️',
                color: 'warning'
            };
        }

        // MEMORY LIMIT EXCEEDED - Show in editor
        if (status === 'MEMORY_EXCEEDED' || verdict === 'MEMORY_LIMIT_EXCEEDED') {
            return {
                category: 'EDITOR_ERROR',
                type: 'MEMORY_LIMIT_EXCEEDED',
                showInEditor: true,
                showInResults: false,
                title: 'Memory Limit Exceeded',
                message: 'Your code used too much memory',
                details: 'Consider optimizing your space complexity',
                icon: '💾',
                color: 'warning'
            };
        }

        // WRONG ANSWER - Show ONLY in results panel, NOT in editor
        if (verdict === 'WRONG_ANSWER') {
            return {
                category: 'TEST_CASE_ERROR',
                type: 'WRONG_ANSWER',
                showInEditor: false,  // ❌ Don't show in editor
                showInResults: true,  // ✅ Show in results panel
                title: 'Wrong Answer',
                message: 'Your output does not match the expected output',
                details: null,  // Details shown in test case results
                icon: '❌',
                color: 'error'
            };
        }

        // SUCCESS - No errors
        if (status === 'PASSED' || verdict === 'ACCEPTED') {
            return {
                category: 'SUCCESS',
                type: 'ACCEPTED',
                showInEditor: false,
                showInResults: true,
                title: 'Accepted',
                message: 'All test cases passed!',
                details: null,
                icon: '✅',
                color: 'success'
            };
        }

        // UNKNOWN ERROR - Show in editor
        return {
            category: 'EDITOR_ERROR',
            type: 'INTERNAL_ERROR',
            showInEditor: true,
            showInResults: false,
            title: 'Internal Error',
            message: 'An unexpected error occurred',
            details: error || 'Unknown error',
            icon: '🔴',
            color: 'error'
        };
    }

    /**
     * Parse compilation error to extract useful information
     */
    static parseCompilationError(error) {
        if (!error) return 'Compilation failed';

        // Extract line number and error message
        const lineMatch = error.match(/line (\d+)/i);
        const line = lineMatch ? lineMatch[1] : null;

        // Common compilation errors
        if (error.includes('SyntaxError')) {
            return `Syntax Error${line ? ` on line ${line}` : ''}`;
        }
        if (error.includes('IndentationError')) {
            return `Indentation Error${line ? ` on line ${line}` : ''}`;
        }
        if (error.includes('NameError')) {
            return `Name Error${line ? ` on line ${line}` : ''}: Variable not defined`;
        }
        if (error.includes('TypeError')) {
            return `Type Error${line ? ` on line ${line}` : ''}`;
        }

        // Return first line of error
        return error.split('\n')[0].substring(0, 100);
    }

    /**
     * Parse runtime error to extract useful information
     */
    static parseRuntimeError(error) {
        if (!error) return 'Runtime error occurred';

        // Extract error type
        if (error.includes('IndexError')) {
            return 'Index Error: List index out of range';
        }
        if (error.includes('KeyError')) {
            return 'Key Error: Dictionary key not found';
        }
        if (error.includes('AttributeError')) {
            return 'Attribute Error: Object has no such attribute';
        }
        if (error.includes('ZeroDivisionError')) {
            return 'Division by Zero Error';
        }
        if (error.includes('RecursionError')) {
            return 'Recursion Error: Maximum recursion depth exceeded';
        }
        if (error.includes('MemoryError')) {
            return 'Memory Error: Out of memory';
        }
        if (error.includes('NullPointerException')) {
            return 'Null Pointer Exception';
        }
        if (error.includes('ArrayIndexOutOfBoundsException')) {
            return 'Array Index Out of Bounds';
        }

        // Return first line of error
        return error.split('\n')[0].substring(0, 100);
    }

    /**
     * Process batch results and categorize errors
     */
    static processBatchResults(results) {
        const editorError = results.find(r => {
            const categorized = this.categorize(r);
            return categorized.showInEditor;
        });

        const testCaseResults = results.map(r => {
            const categorized = this.categorize(r);
            return {
                ...r,
                errorCategory: categorized.category,
                errorType: categorized.type,
                showInEditor: categorized.showInEditor,
                showInResults: categorized.showInResults
            };
        });

        return {
            editorError: editorError ? this.categorize(editorError) : null,
            testCaseResults,
            hasEditorError: !!editorError,
            hasTestCaseErrors: testCaseResults.some(r => r.verdict === 'WRONG_ANSWER')
        };
    }

    /**
     * Format error for display in code editor
     */
    static formatForEditor(error) {
        if (!error || !error.showInEditor) return null;

        return {
            severity: error.color === 'error' ? 'error' : 'warning',
            message: error.message,
            details: error.details,
            type: error.type,
            icon: error.icon
        };
    }

    /**
     * Format error for display in results panel
     */
    static formatForResults(results) {
        return results
            .filter(r => r.showInResults)
            .map(r => ({
                testCaseId: r.testCaseId,
                passed: r.passed,
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                error: r.error,
                executionTime: r.executionTime,
                memory: r.memory
            }));
    }
}

module.exports = ErrorCategorizer;
