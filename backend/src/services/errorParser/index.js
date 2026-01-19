const patterns = require('./patterns');

/**
 * Service to parse compilation and runtime errors
 * Converts raw Judge0 output into structured, user-friendly errors
 */
class ErrorParser {
    /**
     * Parse compilation error output
     */
    static parseCompilationError(output, code, language) {
        if (!output) return null;

        const error = {
            type: 'COMPILATION_ERROR',
            raw: output,
            message: 'Code compilation failed',
            line: null,
            column: null,
            suggestion: null
        };

        // Attempt to extract line number
        // Format often: "main.cpp:5:10: error: ..."
        const lineMatch = output.match(/:(\d+):(\d+):/);
        if (lineMatch) {
            error.line = parseInt(lineMatch[1]);
            error.column = parseInt(lineMatch[2]);
        } else {
            // Python traceback style: "File "script.py", line 5"
            const pyLineMatch = output.match(/line (\d+)/);
            if (pyLineMatch) {
                error.line = parseInt(pyLineMatch[1]);
            }
        }

        // Match against known patterns
        const langPatterns = patterns[language] || [];
        for (const p of langPatterns) {
            const match = output.match(p.pattern);
            if (match) {
                error.category = p.category;

                // Dynamic message if extract function exists
                if (p.extract && typeof p.message === 'function') {
                    const extracted = p.extract(match);
                    error.message = p.message(extracted);
                } else if (typeof p.message === 'string') {
                    error.message = p.message;
                }

                error.suggestion = p.suggestions;
                break;
            }
        }

        return error;
    }

    /**
     * Parse runtime error (stderr)
     */
    static parseRuntimeError(stderr, code, language) {
        if (!stderr) return null;

        const error = {
            type: 'RUNTIME_ERROR',
            raw: stderr,
            message: 'Runtime error occurred',
            line: null
        };

        // Extract line number logic similar to compilation
        // Python: "File "script.py", line 5, in <module>"
        const pyLineMatch = stderr.match(/line (\d+)/);
        if (pyLineMatch) {
            error.line = parseInt(pyLineMatch[1]);
        }

        // Match patterns (reuse appropriate patterns)
        const langPatterns = patterns[language] || [];
        for (const p of langPatterns) {
            if (stderr.match(p.pattern)) {
                error.message = typeof p.message === 'function'
                    ? p.message(p.extract(stderr.match(p.pattern)))
                    : p.message;
                error.suggestion = p.suggestions;
                break;
            }
        }

        return error;
    }
}

module.exports = ErrorParser;
