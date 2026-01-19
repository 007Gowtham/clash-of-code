/**
 * Compilation Error Parser
 * Parses compiler output and extracts meaningful error information
 */

class CompileErrorParser {
    /**
     * Parse compilation error output
     * @param {string} compileOutput - Raw compiler output
     * @param {string} language - Programming language
     * @param {string} sourceCode - Original source code
     * @returns {Object} Parsed error information
     */
    static parse(compileOutput, language, sourceCode) {
        if (!compileOutput) {
            return {
                category: 'UNKNOWN',
                title: 'Compilation Error',
                description: 'Your code failed to compile',
                suggestions: ['Check your syntax']
            };
        }

        const parsers = {
            python: this.parsePythonError,
            javascript: this.parseJavaScriptError,
            java: this.parseJavaError,
            cpp: this.parseCppError,
            c: this.parseCError
        };

        const parser = parsers[language] || this.parseGenericError;
        return parser.call(this, compileOutput, sourceCode);
    }

    /**
     * Parse Python compilation errors
     */
    static parsePythonError(compileOutput, sourceCode) {
        // Syntax Error
        if (compileOutput.includes('SyntaxError')) {
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'SYNTAX_ERROR',
                title: `Syntax Error${line ? ` on Line ${line}` : ''}`,
                description: 'Your Python code has a syntax error',
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    'Check for missing colons (:) at the end of if/for/while/def statements',
                    'Verify proper indentation (Python is indent-sensitive)',
                    'Look for unmatched parentheses, brackets, or quotes'
                ],
                example: {
                    wrong: 'if x > 5\n    print(x)',
                    correct: 'if x > 5:\n    print(x)'
                }
            };
        }

        // Indentation Error
        if (compileOutput.includes('IndentationError')) {
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'INDENTATION_ERROR',
                title: `Indentation Error${line ? ` on Line ${line}` : ''}`,
                description: 'Inconsistent or incorrect indentation',
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    'Use consistent indentation (4 spaces recommended)',
                    'Don\'t mix tabs and spaces',
                    'Check that code blocks are properly indented'
                ],
                example: {
                    wrong: 'def foo():\nprint("hello")',
                    correct: 'def foo():\n    print("hello")'
                }
            };
        }

        return this.parseGenericError(compileOutput, sourceCode);
    }

    /**
     * Parse JavaScript compilation errors
     */
    static parseJavaScriptError(compileOutput, sourceCode) {
        // Unexpected token
        if (compileOutput.includes('Unexpected token')) {
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'SYNTAX_ERROR',
                title: `Syntax Error${line ? ` on Line ${line}` : ''}`,
                description: 'Unexpected token in your JavaScript code',
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    'Check for missing semicolons',
                    'Verify brackets and parentheses are balanced',
                    'Look for typos in keywords'
                ]
            };
        }

        return this.parseGenericError(compileOutput, sourceCode);
    }

    /**
     * Parse Java compilation errors
     */
    static parseJavaError(compileOutput, sourceCode) {
        // Missing semicolon
        if (compileOutput.includes("';' expected")) {
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'MISSING_SEMICOLON',
                title: `Missing Semicolon${line ? ` on Line ${line}` : ''}`,
                description: 'You forgot a semicolon at the end of this line',
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    'Add a semicolon (;) at the end of the statement',
                    'Every Java statement must end with a semicolon'
                ],
                example: {
                    wrong: 'int x = 5',
                    correct: 'int x = 5;'
                }
            };
        }

        // Cannot find symbol (undefined variable/method)
        if (compileOutput.includes('cannot find symbol')) {
            const symbolMatch = compileOutput.match(/symbol:\s+(?:variable|method|class)\s+(\w+)/);
            const symbol = symbolMatch ? symbolMatch[1] : 'unknown';
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'UNDEFINED_SYMBOL',
                title: `Undefined ${symbol}`,
                description: `You're using '${symbol}' but it hasn't been declared`,
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    `Declare '${symbol}' before using it`,
                    'Check for typos in the name',
                    'Make sure the variable/method is in scope'
                ],
                example: {
                    wrong: 'result = count + 1;',
                    correct: 'int count = 0;\nresult = count + 1;'
                }
            };
        }

        // Type mismatch
        if (compileOutput.includes('incompatible types')) {
            const typeMatch = compileOutput.match(/required:\s+(\w+).*found:\s+(\w+)/s);
            const expected = typeMatch ? typeMatch[1] : 'unknown';
            const found = typeMatch ? typeMatch[2] : 'unknown';
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'TYPE_MISMATCH',
                title: `Type Mismatch${line ? ` on Line ${line}` : ''}`,
                description: `Expected ${expected}, but got ${found}`,
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    `Convert ${found} to ${expected}`,
                    'Check the variable type declaration',
                    'Use appropriate type casting if needed'
                ]
            };
        }

        // Missing return statement
        if (compileOutput.includes('missing return statement')) {
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'MISSING_RETURN',
                title: 'Missing Return Statement',
                description: 'Your function should return a value, but some paths don\'t',
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    'Add a return statement in all code paths',
                    'Make sure every branch returns a value',
                    'Check if-else statements have returns in both branches'
                ]
            };
        }

        return this.parseGenericError(compileOutput, sourceCode);
    }

    /**
     * Parse C++ compilation errors
     */
    static parseCppError(compileOutput, sourceCode) {
        // Expected semicolon
        if (compileOutput.includes("expected ';'")) {
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'MISSING_SEMICOLON',
                title: `Missing Semicolon${line ? ` on Line ${line}` : ''}`,
                description: 'You forgot a semicolon at the end of this line',
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    'Add a semicolon (;) at the end of the statement',
                    'Every C++ statement must end with a semicolon'
                ]
            };
        }

        // Undeclared identifier
        if (compileOutput.includes('was not declared') || compileOutput.includes('undeclared identifier')) {
            const symbolMatch = compileOutput.match(/'(\w+)'/);
            const symbol = symbolMatch ? symbolMatch[1] : 'unknown';
            const lineMatch = compileOutput.match(/line (\d+)/i);
            const line = lineMatch ? parseInt(lineMatch[1]) : null;

            return {
                category: 'UNDEFINED_SYMBOL',
                title: `Undefined '${symbol}'`,
                description: `'${symbol}' was not declared in this scope`,
                lineNumber: line,
                codeContext: line ? this.getCodeContext(sourceCode, line) : null,
                suggestions: [
                    `Declare '${symbol}' before using it`,
                    'Check for typos',
                    'Include necessary header files'
                ]
            };
        }

        return this.parseGenericError(compileOutput, sourceCode);
    }

    /**
     * Parse C compilation errors
     */
    static parseCError(compileOutput, sourceCode) {
        return this.parseCppError(compileOutput, sourceCode);
    }

    /**
     * Parse generic compilation error
     */
    static parseGenericError(compileOutput, sourceCode) {
        // Try to extract line number
        const lineMatch = compileOutput.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : null;

        return {
            category: 'COMPILATION_ERROR',
            title: `Compilation Error${line ? ` on Line ${line}` : ''}`,
            description: 'Your code failed to compile',
            lineNumber: line,
            codeContext: line ? this.getCodeContext(sourceCode, line) : null,
            rawError: compileOutput,
            suggestions: [
                'Check the error message for details',
                'Verify your syntax is correct',
                'Look for typos or missing symbols'
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

module.exports = CompileErrorParser;
