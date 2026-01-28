/**
 * Input Format Specification Model
 * 
 * Defines the structure of an input parameter format specification.
 */

class InputFormatSpec {
    /**
     * Create an input format specification
     * @param {Object} spec - Specification object
     * @param {number} spec.paramIndex - Parameter index (0-based)
     * @param {string} spec.paramName - Parameter name
     * @param {string} spec.baseType - Base type (primitive, array, matrix, tree, linked_list, graph, custom)
     * @param {string} [spec.elementType] - Element type for arrays/matrices
     * @param {string} spec.parseStrategy - Parsing strategy name
     * @param {string} [spec.inputFormatExample] - Example input format
     * @param {Object} [spec.customTypeRef] - Reference to custom type definition
     * @param {Object} [spec.metadata] - Additional metadata
     */
    constructor(spec) {
        this.paramIndex = spec.paramIndex;
        this.paramName = spec.paramName;
        this.baseType = spec.baseType;
        this.elementType = spec.elementType || null;
        this.parseStrategy = spec.parseStrategy;
        this.inputFormatExample = spec.inputFormatExample || null;
        this.customTypeRef = spec.customTypeRef || null;
        this.metadata = spec.metadata || {};
    }

    /**
     * Validate the format specification
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (typeof this.paramIndex !== 'number' || this.paramIndex < 0) {
            errors.push('paramIndex must be a non-negative number');
        }

        if (!this.paramName || typeof this.paramName !== 'string') {
            errors.push('paramName is required and must be a string');
        }

        if (!this.baseType || typeof this.baseType !== 'string') {
            errors.push('baseType is required and must be a string');
        }

        const validBaseTypes = ['primitive', 'array', 'matrix', 'tree', 'linked_list', 'graph', 'custom'];
        if (this.baseType && !validBaseTypes.includes(this.baseType)) {
            errors.push(`baseType must be one of: ${validBaseTypes.join(', ')}`);
        }

        if (!this.parseStrategy || typeof this.parseStrategy !== 'string') {
            errors.push('parseStrategy is required and must be a string');
        }

        // Validate element type for arrays and matrices
        if ((this.baseType === 'array' || this.baseType === 'matrix') && !this.elementType) {
            errors.push(`elementType is required for ${this.baseType} type`);
        }

        // Validate custom type reference
        if (this.baseType === 'custom' && !this.customTypeRef) {
            errors.push('customTypeRef is required for custom type');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Convert to JSON-serializable object
     * @returns {Object}
     */
    toJSON() {
        return {
            paramIndex: this.paramIndex,
            paramName: this.paramName,
            baseType: this.baseType,
            elementType: this.elementType,
            parseStrategy: this.parseStrategy,
            inputFormatExample: this.inputFormatExample,
            customTypeRef: this.customTypeRef,
            metadata: this.metadata
        };
    }

    /**
     * Create from JSON object
     * @param {Object} json - JSON object
     * @returns {InputFormatSpec}
     */
    static fromJSON(json) {
        return new InputFormatSpec(json);
    }

    /**
     * Create from legacy type string
     * @param {string} typeStr - Legacy type string (e.g., "array<int>", "tree")
     * @param {number} paramIndex - Parameter index
     * @param {string} paramName - Parameter name
     * @returns {InputFormatSpec}
     */
    static fromLegacyType(typeStr, paramIndex, paramName) {
        // Parse legacy type string
        const primitiveTypes = ['int', 'long', 'float', 'double', 'boolean', 'string', 'char'];

        if (primitiveTypes.includes(typeStr)) {
            return new InputFormatSpec({
                paramIndex,
                paramName,
                baseType: 'primitive',
                elementType: typeStr,
                parseStrategy: 'primitive'
            });
        }

        // Array types
        const arrayMatch = typeStr.match(/^array<(.+)>$/);
        if (arrayMatch) {
            return new InputFormatSpec({
                paramIndex,
                paramName,
                baseType: 'array',
                elementType: arrayMatch[1],
                parseStrategy: 'json_array'
            });
        }

        // Matrix types
        const matrixMatch = typeStr.match(/^matrix<(.+)>$/);
        if (matrixMatch) {
            return new InputFormatSpec({
                paramIndex,
                paramName,
                baseType: 'matrix',
                elementType: matrixMatch[1],
                parseStrategy: 'nested_array'
            });
        }

        // Special structures
        if (typeStr === 'tree') {
            return new InputFormatSpec({
                paramIndex,
                paramName,
                baseType: 'tree',
                parseStrategy: 'tree_array'
            });
        }

        if (typeStr === 'linked_list') {
            return new InputFormatSpec({
                paramIndex,
                paramName,
                baseType: 'linked_list',
                parseStrategy: 'linked_list_array'
            });
        }

        if (typeStr === 'graph') {
            return new InputFormatSpec({
                paramIndex,
                paramName,
                baseType: 'graph',
                parseStrategy: 'adjacency_list'
            });
        }

        // Default to primitive
        return new InputFormatSpec({
            paramIndex,
            paramName,
            baseType: 'primitive',
            elementType: 'int',
            parseStrategy: 'primitive'
        });
    }
}

module.exports = InputFormatSpec;
