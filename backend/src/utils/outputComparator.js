/**
 * Output Comparator Utility
 * Provides flexible output comparison for test cases
 */

class OutputComparator {
    /**
     * Comparison modes
     */
    static MODES = {
        EXACT: 'exact',                    // Exact match (default)
        IGNORE_CASE: 'ignore_case',        // Case-insensitive
        IGNORE_WHITESPACE: 'ignore_whitespace', // Ignore extra whitespace
        FLOATING_POINT: 'floating_point',  // Epsilon comparison for floats
        CUSTOM: 'custom',                  // Custom comparison function
    };

    /**
     * Normalize line endings (CRLF → LF)
     */
    static normalizeLineEndings(str) {
        return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    /**
     * Trim whitespace from each line and remove empty lines
     */
    static trimLines(str) {
        return str
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    /**
     * Compare outputs with exact matching
     */
    static exactMatch(expected, actual) {
        const normalizedExpected = this.normalizeLineEndings(expected).trim();
        const normalizedActual = this.normalizeLineEndings(actual).trim();
        return normalizedExpected === normalizedActual;
    }

    /**
     * Compare outputs ignoring case
     */
    static ignoreCaseMatch(expected, actual) {
        const normalizedExpected = this.normalizeLineEndings(expected).trim().toLowerCase();
        const normalizedActual = this.normalizeLineEndings(actual).trim().toLowerCase();
        return normalizedExpected === normalizedActual;
    }

    /**
     * Compare outputs ignoring whitespace
     */
    static ignoreWhitespaceMatch(expected, actual) {
        const normalizedExpected = this.trimLines(this.normalizeLineEndings(expected));
        const normalizedActual = this.trimLines(this.normalizeLineEndings(actual));
        return normalizedExpected === normalizedActual;
    }

    /**
     * Compare floating-point numbers with epsilon tolerance
     */
    static floatingPointMatch(expected, actual, epsilon = 0.0001) {
        const expectedNums = this.extractNumbers(expected);
        const actualNums = this.extractNumbers(actual);

        if (expectedNums.length !== actualNums.length) {
            return false;
        }

        for (let i = 0; i < expectedNums.length; i++) {
            if (Math.abs(expectedNums[i] - actualNums[i]) > epsilon) {
                return false;
            }
        }

        return true;
    }

    /**
     * Extract all numbers from a string
     */
    static extractNumbers(str) {
        const matches = str.match(/-?\d+\.?\d*/g);
        return matches ? matches.map(parseFloat) : [];
    }

    /**
     * Main comparison function
     * @param {string} expected - Expected output
     * @param {string} actual - Actual output
     * @param {string} mode - Comparison mode
     * @param {Object} options - Additional options
     * @returns {boolean} Whether outputs match
     */
    static compare(expected, actual, mode = this.MODES.EXACT, options = {}) {
        // Handle null/undefined
        if (!expected && !actual) return true;
        if (!expected || !actual) return false;

        switch (mode) {
            case this.MODES.EXACT:
                return this.exactMatch(expected, actual);

            case this.MODES.IGNORE_CASE:
                return this.ignoreCaseMatch(expected, actual);

            case this.MODES.IGNORE_WHITESPACE:
                return this.ignoreWhitespaceMatch(expected, actual);

            case this.MODES.FLOATING_POINT:
                return this.floatingPointMatch(
                    expected,
                    actual,
                    options.epsilon || 0.0001
                );

            case this.MODES.CUSTOM:
                if (typeof options.customComparator === 'function') {
                    return options.customComparator(expected, actual);
                }
                throw new Error('Custom comparator function not provided');

            default:
                return this.exactMatch(expected, actual);
        }
    }

    /**
     * Generate diff between expected and actual output
     * @param {string} expected - Expected output
     * @param {string} actual - Actual output
     * @returns {Object} Diff information
     */
    static generateDiff(expected, actual) {
        const expectedLines = this.normalizeLineEndings(expected).split('\n');
        const actualLines = this.normalizeLineEndings(actual).split('\n');

        const diff = {
            expectedLines: expectedLines.length,
            actualLines: actualLines.length,
            differences: [],
        };

        const maxLines = Math.max(expectedLines.length, actualLines.length);

        for (let i = 0; i < maxLines; i++) {
            const expectedLine = expectedLines[i] || '';
            const actualLine = actualLines[i] || '';

            if (expectedLine !== actualLine) {
                diff.differences.push({
                    line: i + 1,
                    expected: expectedLine,
                    actual: actualLine,
                    type: !expectedLine ? 'extra' : !actualLine ? 'missing' : 'different',
                });
            }
        }

        return diff;
    }

    /**
     * Format diff for display
     * @param {Object} diff - Diff object from generateDiff
     * @returns {string} Formatted diff string
     */
    static formatDiff(diff) {
        if (diff.differences.length === 0) {
            return 'No differences found';
        }

        let output = `Found ${diff.differences.length} difference(s):\n\n`;

        diff.differences.forEach(d => {
            output += `Line ${d.line} (${d.type}):\n`;
            output += `  Expected: "${d.expected}"\n`;
            output += `  Actual:   "${d.actual}"\n\n`;
        });

        return output;
    }

    /**
     * Get comparison summary
     * @param {string} expected - Expected output
     * @param {string} actual - Actual output
     * @param {string} mode - Comparison mode
     * @returns {Object} Comparison summary
     */
    static getSummary(expected, actual, mode = this.MODES.EXACT) {
        const matches = this.compare(expected, actual, mode);
        const diff = matches ? null : this.generateDiff(expected, actual);

        return {
            matches,
            mode,
            diff,
            formattedDiff: diff ? this.formatDiff(diff) : null,
        };
    }
}

module.exports = OutputComparator;
