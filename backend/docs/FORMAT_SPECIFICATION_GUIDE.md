# Format Specification Guide

## Quick Reference for Creating Format Specifications

This guide shows how to define input and output format specifications for questions in the metadata-driven wrapper generation system.

---

## Table of Contents

1. [Basic Concepts](#basic-concepts)
2. [Input Format Specifications](#input-format-specifications)
3. [Output Format Specifications](#output-format-specifications)
4. [Available Strategies](#available-strategies)
5. [Common Examples](#common-examples)
6. [Custom Types](#custom-types)
7. [Validation](#validation)

---

## Basic Concepts

### What are Format Specifications?

Format specifications describe:
- **How input data is structured** (parsing)
- **How output data should be formatted** (serialization)
- **What strategies to use** for parsing/serialization

### Why Use Format Specifications?

- **No code changes** when adding new problem formats
- **Consistent behavior** across all languages
- **Automatic validation** of test cases
- **Clear documentation** of expected formats

---

## Input Format Specifications

### Structure

```json
{
  "paramIndex": 0,           // Parameter position (0-based)
  "paramName": "nums",       // Parameter name
  "baseType": "array",       // Base type category
  "elementType": "int",      // Element type (for arrays/matrices)
  "parseStrategy": "json_array",  // Parsing strategy to use
  "inputFormatExample": "[1,2,3]", // Example input
  "metadata": {}             // Additional metadata (optional)
}
```

### Base Types

| Base Type | Description | Example |
|-----------|-------------|---------|
| `primitive` | Single value | `5`, `"hello"`, `true` |
| `array` | One-dimensional array | `[1,2,3,4,5]` |
| `matrix` | Two-dimensional array | `[[1,2],[3,4]]` |
| `tree` | Binary tree | `[1,2,3,null,null,4,5]` |
| `linked_list` | Linked list | `[1,2,3,4,5]` |
| `graph` | Graph (adjacency list) | `[[1,2],[0,2],[0,1]]` |
| `custom` | Custom data structure | User-defined |

### Element Types

For `array` and `matrix` base types:

- `int` - Integer numbers
- `long` - Long integers
- `float` - Floating point numbers
- `double` - Double precision floats
- `string` - Text strings
- `boolean` - True/false values
- `char` - Single characters

---

## Output Format Specifications

### Structure

```json
{
  "baseType": "array",       // Base type category
  "elementType": "int",      // Element type (for arrays/matrices)
  "serializeStrategy": "json_array",  // Serialization strategy
  "outputFormatExample": "[0,1]",     // Example output
  "metadata": {}             // Additional metadata (optional)
}
```

### Special Base Type

- `void` - No return value (for procedures)

---

## Available Strategies

### Parsing Strategies

| Strategy | Use For | Input Format |
|----------|---------|--------------|
| `primitive` | Single values | `5`, `"hello"`, `true` |
| `json_array` | Arrays from JSON | `[1,2,3,4,5]` |
| `json_object` | Objects from JSON | `{"key": "value"}` |
| `space_separated` | Space-separated values | `1 2 3 4 5` |
| `tree_array` | Binary trees | `[1,2,3,null,null,4,5]` |
| `linked_list_array` | Linked lists | `[1,2,3,4,5]` |
| `adjacency_list` | Graphs | `[[1,2],[0,2],[0,1]]` |

### Serialization Strategies

| Strategy | Use For | Output Format |
|----------|---------|---------------|
| `primitive` | Single values | `5`, `"hello"`, `true` |
| `json_array` | Arrays to JSON | `[1,2,3,4,5]` |
| `json_object` | Objects to JSON | `{"key": "value"}` |
| `tree_array` | Binary trees | `[1,2,3,null,null,4,5]` |
| `linked_list_array` | Linked lists | `[1,2,3,4,5]` |

---

## Common Examples

### Example 1: Two Sum

**Problem:** Given an array of integers and a target, return indices of two numbers that add up to target.

**Function Signature:** `int[] twoSum(int[] nums, int target)`

**Format Specification:**

```json
{
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "nums",
      "baseType": "array",
      "elementType": "int",
      "parseStrategy": "json_array",
      "inputFormatExample": "[2,7,11,15]"
    },
    {
      "paramIndex": 1,
      "paramName": "target",
      "baseType": "primitive",
      "elementType": "int",
      "parseStrategy": "primitive",
      "inputFormatExample": "9"
    }
  ],
  "outputFormat": {
    "baseType": "array",
    "elementType": "int",
    "serializeStrategy": "json_array",
    "outputFormatExample": "[0,1]"
  }
}
```

**Test Case:**
```
Input:
[2,7,11,15]
9

Output:
[0,1]
```

---

### Example 2: Reverse Linked List

**Problem:** Reverse a singly linked list.

**Function Signature:** `ListNode* reverseList(ListNode* head)`

**Format Specification:**

```json
{
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "head",
      "baseType": "linked_list",
      "parseStrategy": "linked_list_array",
      "inputFormatExample": "[1,2,3,4,5]"
    }
  ],
  "outputFormat": {
    "baseType": "linked_list",
    "serializeStrategy": "linked_list_array",
    "outputFormatExample": "[5,4,3,2,1]"
  }
}
```

**Test Case:**
```
Input:
[1,2,3,4,5]

Output:
[5,4,3,2,1]
```

---

### Example 3: Valid Parentheses

**Problem:** Determine if a string of parentheses is valid.

**Function Signature:** `boolean isValid(string s)`

**Format Specification:**

```json
{
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "s",
      "baseType": "primitive",
      "elementType": "string",
      "parseStrategy": "primitive",
      "inputFormatExample": "()[]{}"
    }
  ],
  "outputFormat": {
    "baseType": "primitive",
    "elementType": "boolean",
    "serializeStrategy": "primitive",
    "outputFormatExample": "true"
  }
}
```

**Test Case:**
```
Input:
()[]{}

Output:
true
```

---

### Example 4: Matrix Search

**Problem:** Search for a value in a 2D matrix.

**Function Signature:** `boolean searchMatrix(int[][] matrix, int target)`

**Format Specification:**

```json
{
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "matrix",
      "baseType": "matrix",
      "elementType": "int",
      "parseStrategy": "nested_array",
      "inputFormatExample": "[[1,3,5,7],[10,11,16,20],[23,30,34,60]]"
    },
    {
      "paramIndex": 1,
      "paramName": "target",
      "baseType": "primitive",
      "elementType": "int",
      "parseStrategy": "primitive",
      "inputFormatExample": "3"
    }
  ],
  "outputFormat": {
    "baseType": "primitive",
    "elementType": "boolean",
    "serializeStrategy": "primitive",
    "outputFormatExample": "true"
  }
}
```

---

### Example 5: Binary Tree Level Order Traversal

**Problem:** Return level order traversal of a binary tree.

**Function Signature:** `int[][] levelOrder(TreeNode* root)`

**Format Specification:**

```json
{
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "root",
      "baseType": "tree",
      "parseStrategy": "tree_array",
      "inputFormatExample": "[3,9,20,null,null,15,7]"
    }
  ],
  "outputFormat": {
    "baseType": "matrix",
    "elementType": "int",
    "serializeStrategy": "nested_array",
    "outputFormatExample": "[[3],[9,20],[15,7]]"
  }
}
```

---

## Custom Types

### Defining Custom Types

For problems with custom data structures:

```json
{
  "customTypes": {
    "Point": {
      "fields": [
        { "name": "x", "type": "int" },
        { "name": "y", "type": "int" }
      ],
      "templates": {
        "cpp": "struct Point { int x; int y; };",
        "java": "class Point { int x; int y; }",
        "python": "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y",
        "javascript": "class Point { constructor(x, y) { this.x = x; this.y = y; } }"
      }
    }
  },
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "points",
      "baseType": "array",
      "elementType": "custom",
      "customTypeRef": "Point",
      "parseStrategy": "array_of_objects",
      "inputFormatExample": "[{\"x\":1,\"y\":2},{\"x\":3,\"y\":4}]"
    }
  ]
}
```

---

## Validation

### Validating Format Specifications

Use the `FormatSpecificationResolver` to validate:

```javascript
const resolver = require('./FormatSpecificationResolver');

const validation = resolver.validateFormatSpecifications(question);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Common Validation Errors

1. **Missing required fields**
   - `paramIndex`, `paramName`, `baseType`, `parseStrategy`

2. **Invalid base type**
   - Must be one of: primitive, array, matrix, tree, linked_list, graph, custom, void

3. **Missing element type**
   - Required for array and matrix types

4. **Invalid strategy**
   - Strategy must be registered in StrategyRegistry

---

## Best Practices

### 1. Use Descriptive Parameter Names

❌ Bad:
```json
{ "paramName": "param0" }
```

✅ Good:
```json
{ "paramName": "nums" }
```

### 2. Provide Format Examples

Always include `inputFormatExample` and `outputFormatExample`:

```json
{
  "inputFormatExample": "[1,2,3,4,5]",
  "outputFormatExample": "[0,1]"
}
```

### 3. Choose Appropriate Strategies

Match the strategy to your input format:

- JSON arrays → `json_array`
- Space-separated → `space_separated`
- Trees → `tree_array`

### 4. Validate Before Saving

Always validate format specifications before saving questions:

```javascript
const validation = resolver.validateFormatSpecifications(question);
if (!validation.valid) {
  throw new Error(`Invalid format: ${validation.errors.join(', ')}`);
}
```

---

## Troubleshooting

### Problem: Strategy Not Found

**Error:** `Parsing strategy 'xyz' not found`

**Solution:** Check available strategies:
```javascript
const registry = require('./StrategyRegistry');
console.log(registry.getStrategyInfo());
```

### Problem: Validation Fails

**Error:** `elementType is required for array type`

**Solution:** Add `elementType` to your specification:
```json
{
  "baseType": "array",
  "elementType": "int",  // Add this
  "parseStrategy": "json_array"
}
```

### Problem: Test Case Format Mismatch

**Error:** `Test case input does not match format specification`

**Solution:** Ensure test case input matches `inputFormatExample`:
```json
{
  "inputFormatExample": "[1,2,3]",  // Format
  "testCaseInput": "[1,2,3]"        // Must match
}
```

---

## Migration from Legacy Format

### Legacy Format (Old)

```json
{
  "inputType": "[\"array<int>\", \"int\"]",
  "outputType": "\"array<int>\""
}
```

### New Format (Recommended)

```json
{
  "inputFormats": [
    {
      "paramIndex": 0,
      "paramName": "nums",
      "baseType": "array",
      "elementType": "int",
      "parseStrategy": "json_array"
    },
    {
      "paramIndex": 1,
      "paramName": "target",
      "baseType": "primitive",
      "elementType": "int",
      "parseStrategy": "primitive"
    }
  ],
  "outputFormat": {
    "baseType": "array",
    "elementType": "int",
    "serializeStrategy": "json_array"
  }
}
```

**Note:** Legacy format is still supported for backward compatibility.

---

## Summary

Format specifications provide a powerful, flexible way to define input/output formats for coding problems:

✅ **Metadata-driven** - No code changes needed
✅ **Language-agnostic** - Works for all languages
✅ **Validated** - Automatic validation
✅ **Extensible** - Easy to add new formats
✅ **Backward compatible** - Legacy questions still work

For more information, see:
- `METADATA_WRAPPER_IMPLEMENTATION.md` - Implementation details
- `STRATEGY_DEVELOPMENT_GUIDE.md` - Creating new strategies
- `.agent/workflows/metadata-driven-wrapper-implementation.md` - Full roadmap

---

**Last Updated:** 2026-01-25
