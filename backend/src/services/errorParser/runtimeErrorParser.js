/**
 * Runtime Error Parser
 * Parses runtime errors and stack traces
 */

class RuntimeErrorParser {
    /**
     * Parse runtime error
     * @param {string} stderr - Standard error output
     * @param {number} statusId - Judge0 status ID
     * @param {string} language - Programming language
     * @param {string} sourceCode - Original source code
     * @returns {Object} Parsed error information
     */
    static parse(stderr, statusId, language, sourceCode) {
        if (!stderr) {
            return {
                category: 'RUNTIME_ERROR',
                title: 'Runtime Error',
                description: 'Your code crashed during execution',
                suggestions: ['Check the error message for details']
            };
        }

        // Division by zero (SIGFPE)
        if (statusId === 13 || this.isDivisionByZero(stderr)) {
            return this.parseDivisionByZero(stderr, sourceCode);
        }

        // Array index out of bounds
        if (this.isArrayOutOfBounds(stderr)) {
            return this.parseArrayOutOfBounds(stderr, sourceCode, language);
        }

        // Null pointer / Segmentation fault
        if (this.isNullPointer(stderr)) {
            return this.parseNullPointer(stderr, sourceCode, language);
        }

        // Stack overflow
        if (this.isStackOverflow(stderr)) {
            return this.parseStackOverflow(stderr, sourceCode);
        }

        // Generic runtime error
        return this.parseGenericRuntimeError(stderr, sourceCode, language);
    }

    /**
     * Check if error is division by zero
     */
    static isDivisionByZero(stderr) {
        return stderr.toLowerCase().includes('division by zero') ||
            stderr.toLowerCase().includes('zerodivisionerror') ||
            stderr.includes('SIGFPE');
    }

    /**
     * Parse division by zero error
     */
    static parseDivisionByZero(stderr, sourceCode) {
        const lineMatch = stderr.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : null;

        return {
            category: 'DIVISION_BY_ZERO',
            title: 'Division by Zero',
            description: 'Your code tried to divide by zero, which is mathematically undefined',
            lineNumber: line,
            codeContext: line ? this.getCodeContext(sourceCode, line) : null,
            suggestions: [
                'Check if the divisor is zero before dividing',
                'Add validation: if (b != 0) { result = a / b; }',
                'Handle the zero case separately'
            ],
            example: {
                wrong: 'result = a / b;',
                correct: 'if (b != 0) {\n    result = a / b;\n} else {\n    // Handle division by zero\n}'
            },
            debugTips: [
                'Print the divisor value before division',
                'Check input validation',
                'Consider edge cases where divisor might be zero'
            ]
        };
    }

    /**
     * Check if error is array out of bounds
     */
    static isArrayOutOfBounds(stderr) {
        return stderr.includes('ArrayIndexOutOfBoundsException') ||
            stderr.includes('IndexError') ||
            stderr.includes('index out of range') ||
            stderr.includes('vector::_M_range_check');
    }

    /**
     * Parse array out of bounds error
     */
    static parseArrayOutOfBounds(stderr, sourceCode, language) {
        const lineMatch = stderr.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : null;

        // Try to extract index and size
        const indexMatch = stderr.match(/index[:\s]+(\d+)/i) || stderr.match(/\[(\d+)\]/);
        const sizeMatch = stderr.match(/(?:size|length)[:\s]+(\d+)/i);

        const index = indexMatch ? indexMatch[1] : 'unknown';
        const size = sizeMatch ? sizeMatch[1] : 'unknown';

        return {
            category: 'ARRAY_OUT_OF_BOUNDS',
            title: 'Array Index Out of Bounds',
            description: `You tried to access index ${index}${size !== 'unknown' ? `, but the array only has ${size} elements` : ''}`,
            lineNumber: line,
            codeContext: line ? this.getCodeContext(sourceCode, line) : null,
            details: {
                index,
                arraySize: size,
                validRange: size !== 'unknown' ? `0 to ${parseInt(size) - 1}` : 'unknown'
            },
            suggestions: [
                'Check array bounds before accessing: if (i < arr.length)',
                'Fix off-by-one errors in loops: use i < n instead of i <= n',
                'Verify the index variable is correct',
                'Make sure the array has been properly initialized'
            ],
            commonCauses: [
                'Off-by-one error in loop: for(i=0; i<=n; i++) should be i<n',
                'Didn\'t check array length before accessing',
                'Wrong variable used as index',
                'Array is smaller than expected'
            ],
            example: {
                wrong: 'for (int i = 0; i <= arr.length; i++) {\n    arr[i] = value;\n}',
                correct: 'for (int i = 0; i < arr.length; i++) {\n    arr[i] = value;\n}'
            }
        };
    }

    /**
     * Check if error is null pointer
     */
    static isNullPointer(stderr) {
        return stderr.includes('NullPointerException') ||
            stderr.includes('null pointer') ||
            stderr.includes('SIGSEGV') ||
            stderr.includes('segmentation fault') ||
            stderr.includes('AttributeError') && stderr.includes('NoneType');
    }

    /**
     * Parse null pointer error
     */
    static parseNullPointer(stderr, sourceCode, language) {
        const lineMatch = stderr.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : null;

        // Try to extract variable name
        const varMatch = stderr.match(/object '(\w+)'/i) || stderr.match(/'(\w+)' is None/i);
        const varName = varMatch ? varMatch[1] : 'object';

        return {
            category: 'NULL_POINTER',
            title: 'Null Pointer Error',
            description: `You tried to use ${varName} that doesn't exist (null/None)`,
            lineNumber: line,
            codeContext: line ? this.getCodeContext(sourceCode, line) : null,
            suggestions: [
                `Add null check: if (${varName} != null) { ... }`,
                `Initialize ${varName} before using it`,
                'Check if the function returned null unexpectedly',
                'Verify object creation was successful'
            ],
            commonCauses: [
                'Forgot to initialize the object',
                'Function returned null unexpectedly',
                'Accessing object after deletion/deallocation',
                'Dereferencing a null pointer'
            ],
            debugSteps: [
                'Add null check before accessing',
                'Verify initialization before this line',
                'Check if parent function returned null',
                'Print the variable to see if it\'s null'
            ],
            example: {
                wrong: 'result = obj.getValue();',
                correct: 'if (obj != null) {\n    result = obj.getValue();\n} else {\n    // Handle null case\n}'
            }
        };
    }

    /**
     * Check if error is stack overflow
     */
    static isStackOverflow(stderr) {
        return stderr.includes('StackOverflowError') ||
            stderr.includes('stack overflow') ||
            stderr.includes('recursion depth exceeded') ||
            stderr.includes('maximum recursion depth');
    }

    /**
     * Parse stack overflow error
     */
    static parseStackOverflow(stderr, sourceCode) {
        const lineMatch = stderr.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : null;

        // Try to extract function name
        const funcMatch = stderr.match(/in (\w+)/i) || stderr.match(/at (\w+)/i);
        const funcName = funcMatch ? funcMatch[1] : 'recursive function';

        return {
            category: 'STACK_OVERFLOW',
            title: 'Stack Overflow: Infinite Recursion',
            description: `Your recursive function '${funcName}' never stops calling itself`,
            lineNumber: line,
            codeContext: line ? this.getCodeContext(sourceCode, line) : null,
            suggestions: [
                'Add or fix the base case in your recursion',
                'Make sure the base case is reachable',
                'Ensure recursive calls reduce the problem size',
                'Consider using iteration instead of recursion'
            ],
            commonCauses: [
                'Missing base case',
                'Base case never reached',
                'Recursive call doesn\'t reduce problem size',
                'Wrong condition in base case'
            ],
            debugTips: [
                'Add print statements to track recursion depth',
                'Verify base case is correct',
                'Check that each recursive call gets closer to base case',
                'Add a counter to limit recursion depth while debugging'
            ],
            example: {
                wrong: 'def fibonacci(n):\n    return fibonacci(n-1) + fibonacci(n-2)',
                correct: 'def fibonacci(n):\n    if n <= 1:  # Base case\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)'
            }
        };
    }

    /**
     * Parse generic runtime error
     */
    static parseGenericRuntimeError(stderr, sourceCode, language) {
        const lineMatch = stderr.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : null;

        // Try to extract error type
        const errorTypeMatch = stderr.match(/(\w+Error|\w+Exception)/);
        const errorType = errorTypeMatch ? errorTypeMatch[1] : 'Runtime Error';

        return {
            category: 'RUNTIME_ERROR',
            title: errorType,
            description: 'Your code crashed during execution',
            lineNumber: line,
            codeContext: line ? this.getCodeContext(sourceCode, line) : null,
            rawError: stderr,
            suggestions: [
                'Check the error message for details',
                'Add error handling (try-catch)',
                'Verify input values are valid',
                'Check for edge cases'
            ],
            debugTips: [
                'Add print statements to track execution',
                'Check variable values before the crash',
                'Test with smaller inputs',
                'Review the stack trace'
            ]
        };
    }

    /**
     * Get code context around an error line
     */
    static getCodeContext(sourceCode, lineNumber, contextLines = 2) {
        if (!sourceCode || !lineNumber) return null;

        const lines = sourceCode.split('\n');
        const startLine = Math.max(0, lineNumber - contextLines - 1);
        const endLine = Math.min(lines.length, lineNumber + contextLines);

        const before = [];
        const after = [];

        for (let i = startLine; i < lineNumber - 1; i++) {
            before.push(`${i + 1}: ${lines[i]}`);
        }

        const errorLine = `${lineNumber}: ${lines[lineNumber - 1]}`;

        for (let i = lineNumber; i < endLine; i++) {
            after.push(`${i + 1}: ${lines[i]}`);
        }

        return {
            before,
            errorLine,
            after
        };
    }
}

module.exports = RuntimeErrorParser;
