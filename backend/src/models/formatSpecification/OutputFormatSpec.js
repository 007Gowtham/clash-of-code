/**
 * Output Format Specification Model
 * 
 * Defines the structure of an output format specification.
 */

class OutputFormatSpec {
    /**
     * Create an output format specification
     * @param {Object} spec - Specification object
     * @param {string} spec.baseType - Base type (primitive, array, matrix, tree, linked_list, graph, custom, void)
     * @param {string} [spec.elementType] - Element type for arrays/matrices
     * @param {string} spec.serializeStrategy - Serialization strategy name
     * @param {string} [spec.outputFormatExample] - Example output format
     * @param {Object} [spec.customTypeRef] - Reference to custom type definition
     * @param {Object} [spec.metadata] - Additional metadata
     */
    constructor(spec) {
        this.baseType = spec.baseType;
        this.elementType = spec.elementType || null;
        this.serializeStrategy = spec.serializeStrategy;
        this.outputFormatExample = spec.outputFormatExample || null;
        this.customTypeRef = spec.customTypeRef || null;
        this.metadata = spec.metadata || {};
    }

    /**
     * Validate the format specification
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.baseType || typeof this.baseType !== 'string') {
            errors.push('baseType is required and must be a string');
        }

        const validBaseTypes = ['primitive', 'array', 'matrix', 'tree', 'linked_list', 'graph', 'custom', 'void'];
        if (this.baseType && !validBaseTypes.includes(this.baseType)) {
            errors.push(`baseType must be one of: ${validBaseTypes.join(', ')}`);
        }

        if (!this.serializeStrategy || typeof this.serializeStrategy !== 'string') {
            errors.push('serializeStrategy is required and must be a string');
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
            baseType: this.baseType,
            elementType: this.elementType,
            serializeStrategy: this.serializeStrategy,
            outputFormatExample: this.outputFormatExample,
            customTypeRef: this.customTypeRef,
            metadata: this.metadata
        };
    }

    /**
     * Create from JSON object
     * @param {Object} json - JSON object
     * @returns {OutputFormatSpec}
     */
    static fromJSON(json) {
        return new OutputFormatSpec(json);
    }

    /**
     * Create from legacy type string
     * @param {string} typeStr - Legacy type string (e.g., "array<int>", "tree")
     * @returns {OutputFormatSpec}
     */
    static fromLegacyType(typeStr) {
        if (!typeStr) {
            return new OutputFormatSpec({
                baseType: 'void',
                serializeStrategy: 'void'
            });
        }

        // Parse legacy type string
        const primitiveTypes = ['int', 'long', 'float', 'double', 'boolean', 'string', 'char'];

        if (primitiveTypes.includes(typeStr)) {
            return new OutputFormatSpec({
                baseType: 'primitive',
                elementType: typeStr,
                serializeStrategy: 'primitive'
            });
        }

        // Array types
        const arrayMatch = typeStr.match(/^array<(.+)>$/);
        if (arrayMatch) {
            return new OutputFormatSpec({
                baseType: 'array',
                elementType: arrayMatch[1],
                serializeStrategy: 'json_array'
            });
        }

        // Matrix types
        const matrixMatch = typeStr.match(/^matrix<(.+)>$/);
        if (matrixMatch) {
            return new OutputFormatSpec({
                baseType: 'matrix',
                elementType: matrixMatch[1],
                serializeStrategy: 'nested_array'
            });
        }

        // Special structures
        if (typeStr === 'tree') {
            return new OutputFormatSpec({
                baseType: 'tree',
                serializeStrategy: 'tree_array'
            });
        }

        if (typeStr === 'linked_list') {
            return new OutputFormatSpec({
                baseType: 'linked_list',
                serializeStrategy: 'linked_list_array'
            });
        }

        if (typeStr === 'graph') {
            return new OutputFormatSpec({
                baseType: 'graph',
                serializeStrategy: 'adjacency_list'
            });
        }

        // Default to primitive int
        return new OutputFormatSpec({
            baseType: 'primitive',
            elementType: 'int',
            serializeStrategy: 'primitive'
        });
    }
}

module.exports = OutputFormatSpec;
