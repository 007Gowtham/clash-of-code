/**
 * Semantic Validator
 * Deep comparison engine for validating algorithmic outputs
 * Handles: arrays, objects, trees, graphs, floats, strings
 * 
 * CRITICAL: This is NOT string comparison!
 * "[[3], [9, 20]]" === "[[3],[9,20]]" (semantically equal)
 */

class SemanticValidator {
    /**
     * Deep equality comparison
     * @param {*} actual - User's output
     * @param {*} expected - Expected output
     * @param {Object} options - Comparison options
     * @returns {boolean} Whether outputs are semantically equal
     */
    static deepEquals(actual, expected, options = {}) {
        const {
            epsilon = 1e-9,           // Float comparison tolerance
            ignoreOrder = false,      // For unordered collections
            caseSensitive = true,     // String comparison
            nullEqualsUndefined = true // null == undefined
        } = options;

        // Handle null/undefined
        if (actual === null && expected === null) return true;
        if (actual === undefined && expected === undefined) return true;
        if (nullEqualsUndefined && (actual === null || actual === undefined) &&
            (expected === null || expected === undefined)) return true;
        if (actual === null || actual === undefined || expected === null || expected === undefined) {
            return false;
        }

        // Type checking
        const actualType = this.getType(actual);
        const expectedType = this.getType(expected);

        if (actualType !== expectedType) return false;

        // Primitive types
        if (actualType === 'number') {
            return this.compareNumbers(actual, expected, epsilon);
        }

        if (actualType === 'string') {
            return caseSensitive ? actual === expected :
                actual.toLowerCase() === expected.toLowerCase();
        }

        if (actualType === 'boolean') {
            return actual === expected;
        }

        // Arrays
        if (actualType === 'array') {
            return this.compareArrays(actual, expected, { ...options, ignoreOrder });
        }

        // Objects
        if (actualType === 'object') {
            return this.compareObjects(actual, expected, options);
        }

        // Fallback to strict equality
        return actual === expected;
    }

    /**
     * Get precise type of value
     */
    static getType(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Date) return 'date';
        if (value instanceof RegExp) return 'regexp';
        return typeof value;
    }

    /**
     * Compare numbers with epsilon tolerance
     */
    static compareNumbers(a, b, epsilon = 1e-9) {
        // Handle special cases
        if (Number.isNaN(a) && Number.isNaN(b)) return true;
        if (Number.isNaN(a) || Number.isNaN(b)) return false;
        if (!Number.isFinite(a) && !Number.isFinite(b)) return a === b;
        if (!Number.isFinite(a) || !Number.isFinite(b)) return false;

        // Epsilon comparison for floats
        return Math.abs(a - b) <= epsilon;
    }

    /**
     * Compare arrays (ordered or unordered)
     */
    static compareArrays(actual, expected, options = {}) {
        if (actual.length !== expected.length) return false;

        if (options.ignoreOrder) {
            // For unordered comparison, sort first
            const sortedActual = [...actual].sort();
            const sortedExpected = [...expected].sort();
            return sortedActual.every((val, idx) =>
                this.deepEquals(val, sortedExpected[idx], options)
            );
        }

        // Ordered comparison
        return actual.every((val, idx) =>
            this.deepEquals(val, expected[idx], options)
        );
    }

    /**
     * Compare objects (key-value pairs)
     */
    static compareObjects(actual, expected, options = {}) {
        const actualKeys = Object.keys(actual);
        const expectedKeys = Object.keys(expected);

        if (actualKeys.length !== expectedKeys.length) return false;

        // Check if all keys match
        const allKeysMatch = actualKeys.every(key => expectedKeys.includes(key));
        if (!allKeysMatch) return false;

        // Compare values for each key
        return actualKeys.every(key =>
            this.deepEquals(actual[key], expected[key], options)
        );
    }

    /**
     * Validate output with detailed feedback
     * @param {*} actual - User's output
     * @param {*} expected - Expected output
     * @param {Object} options - Validation options
     * @returns {Object} Validation result with details
     */
    static validate(actual, expected, options = {}) {
        const isEqual = this.deepEquals(actual, expected, options);

        if (isEqual) {
            return {
                passed: true,
                actual,
                expected,
                message: 'Output matches expected result'
            };
        }

        // Generate detailed diff
        const diff = this.generateDiff(actual, expected);

        return {
            passed: false,
            actual,
            expected,
            diff,
            message: this.formatDiffMessage(diff)
        };
    }

    /**
     * Generate diff between actual and expected
     */
    static generateDiff(actual, expected) {
        const actualType = this.getType(actual);
        const expectedType = this.getType(expected);

        if (actualType !== expectedType) {
            return {
                type: 'TYPE_MISMATCH',
                actualType,
                expectedType,
                message: `Expected type ${expectedType}, got ${actualType}`
            };
        }

        if (actualType === 'array') {
            return this.generateArrayDiff(actual, expected);
        }

        if (actualType === 'object') {
            return this.generateObjectDiff(actual, expected);
        }

        return {
            type: 'VALUE_MISMATCH',
            actual,
            expected,
            message: `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        };
    }

    /**
     * Generate diff for arrays
     */
    static generateArrayDiff(actual, expected) {
        const differences = [];

        if (actual.length !== expected.length) {
            differences.push({
                type: 'LENGTH_MISMATCH',
                actualLength: actual.length,
                expectedLength: expected.length
            });
        }

        const maxLength = Math.max(actual.length, expected.length);
        for (let i = 0; i < maxLength; i++) {
            if (!this.deepEquals(actual[i], expected[i])) {
                differences.push({
                    type: 'ELEMENT_MISMATCH',
                    index: i,
                    actual: actual[i],
                    expected: expected[i]
                });
            }
        }

        return {
            type: 'ARRAY_DIFF',
            differences,
            actualLength: actual.length,
            expectedLength: expected.length
        };
    }

    /**
     * Generate diff for objects
     */
    static generateObjectDiff(actual, expected) {
        const differences = [];
        const allKeys = new Set([...Object.keys(actual), ...Object.keys(expected)]);

        for (const key of allKeys) {
            if (!(key in actual)) {
                differences.push({
                    type: 'MISSING_KEY',
                    key,
                    expected: expected[key]
                });
            } else if (!(key in expected)) {
                differences.push({
                    type: 'EXTRA_KEY',
                    key,
                    actual: actual[key]
                });
            } else if (!this.deepEquals(actual[key], expected[key])) {
                differences.push({
                    type: 'VALUE_MISMATCH',
                    key,
                    actual: actual[key],
                    expected: expected[key]
                });
            }
        }

        return {
            type: 'OBJECT_DIFF',
            differences
        };
    }

    /**
     * Format diff message for user display
     */
    static formatDiffMessage(diff) {
        if (diff.type === 'TYPE_MISMATCH') {
            return `Type mismatch: expected ${diff.expectedType}, got ${diff.actualType}`;
        }

        if (diff.type === 'ARRAY_DIFF') {
            const messages = [];

            if (diff.actualLength !== diff.expectedLength) {
                messages.push(`Length mismatch: expected ${diff.expectedLength}, got ${diff.actualLength}`);
            }

            diff.differences.forEach(d => {
                if (d.type === 'ELEMENT_MISMATCH') {
                    messages.push(`Index ${d.index}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`);
                }
            });

            return messages.join('\n');
        }

        if (diff.type === 'OBJECT_DIFF') {
            const messages = diff.differences.map(d => {
                if (d.type === 'MISSING_KEY') {
                    return `Missing key "${d.key}"`;
                }
                if (d.type === 'EXTRA_KEY') {
                    return `Unexpected key "${d.key}"`;
                }
                return `Key "${d.key}": expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`;
            });

            return messages.join('\n');
        }

        return diff.message || 'Output does not match expected result';
    }

    /**
     * Parse JSON safely
     */
    static parseJSON(str) {
        try {
            return { success: true, data: JSON.parse(str) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Compare JSON strings semantically
     * Useful for comparing stringified outputs
     */
    static compareJSONStrings(actualStr, expectedStr, options = {}) {
        const actualParsed = this.parseJSON(actualStr);
        const expectedParsed = this.parseJSON(expectedStr);

        if (!actualParsed.success) {
            return {
                passed: false,
                error: 'Invalid JSON in actual output',
                details: actualParsed.error
            };
        }

        if (!expectedParsed.success) {
            return {
                passed: false,
                error: 'Invalid JSON in expected output',
                details: expectedParsed.error
            };
        }

        return this.validate(actualParsed.data, expectedParsed.data, options);
    }
}

module.exports = SemanticValidator;
