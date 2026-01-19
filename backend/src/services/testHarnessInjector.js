/**
 * Test Harness Injector
 * Wraps user code with hidden test execution logic
 * Handles input parsing, output serialization, and semantic comparison
 */

const SemanticValidator = require('../utils/semanticValidator');
const { DataStructureParsers } = require('../utils/dataStructureParsers');

class TestHarnessInjector {
    /**
     * Language-specific templates for test harness
     */
    static TEMPLATES = {
        python: {
            imports: `
import json
import sys
from typing import Optional, List, Dict, Any

# Data structure definitions
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
`,
            parsers: `
def deserialize_tree(arr):
    """Convert array to TreeNode"""
    if not arr or arr[0] is None:
        return None
    
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    
    while queue and i < len(arr):
        node = queue.pop(0)
        
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    
    return root

def serialize_tree(root):
    """Convert TreeNode to array"""
    if not root:
        return []
    
    result = []
    queue = [root]
    
    while queue:
        node = queue.pop(0)
        if node is None:
            result.append(None)
        else:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
    
    while result and result[-1] is None:
        result.pop()
    
    return result

def deserialize_linked_list(arr):
    """Convert array to ListNode"""
    if not arr:
        return None
    
    dummy = ListNode(0)
    current = dummy
    
    for val in arr:
        current.next = ListNode(val)
        current = current.next
    
    return dummy.next

def serialize_linked_list(head):
    """Convert ListNode to array"""
    result = []
    current = head
    
    while current:
        result.append(current.val)
        current = current.next
    
    return result

def parse_input(data, input_type):
    """Parse input based on type"""
    if input_type == 'tree':
        return deserialize_tree(data)
    elif input_type == 'linked_list':
        return deserialize_linked_list(data)
    elif input_type in ['array', 'int_array', 'string_array']:
        return data
    elif input_type in ['int', 'number']:
        return int(data) if isinstance(data, str) else data
    elif input_type == 'string':
        return str(data)
    elif input_type == 'boolean':
        return bool(data)
    else:
        return data

def serialize_output(data, output_type):
    """Serialize output based on type"""
    if output_type == 'tree':
        return serialize_tree(data)
    elif output_type == 'linked_list':
        return serialize_linked_list(data)
    else:
        return data
`,
            executor: `
def execute_test():
    """Execute test case"""
    try:
        # Parse test input
        test_input = json.loads('''{{TEST_INPUT}}''')
        expected_output = json.loads('''{{EXPECTED_OUTPUT}}''')
        input_types = json.loads('''{{INPUT_TYPES}}''')
        output_type = '''{{OUTPUT_TYPE}}'''
        
        # Parse inputs
        parsed_inputs = []
        if isinstance(input_types, list):
            for i, input_type in enumerate(input_types):
                parsed_inputs.append(parse_input(test_input[i], input_type))
        else:
            parsed_inputs = [parse_input(test_input, input_types)]
        
        # Execute user solution
        solution = Solution()
        actual_output = solution.{{FUNCTION_NAME}}(*parsed_inputs)
        
        # Serialize output for comparison
        serialized_output = serialize_output(actual_output, output_type)
        
        # Return result
        result = {
            "status": "SUCCESS",
            "output": serialized_output,
            "expected": expected_output
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        import traceback
        result = {
            "status": "ERROR",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(result))

execute_test()
`
        },

        javascript: {
            imports: `
// Data structure definitions
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}
`,
            parsers: `
function deserializeTree(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    
    const root = new TreeNode(arr[0]);
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < arr.length) {
        const node = queue.shift();
        
        if (i < arr.length && arr[i] !== null) {
            node.left = new TreeNode(arr[i]);
            queue.push(node.left);
        }
        i++;
        
        if (i < arr.length && arr[i] !== null) {
            node.right = new TreeNode(arr[i]);
            queue.push(node.right);
        }
        i++;
    }
    
    return root;
}

function serializeTree(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        if (node === null) {
            result.push(null);
        } else {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        }
    }
    
    while (result.length > 0 && result[result.length - 1] === null) {
        result.pop();
    }
    
    return result;
}

function deserializeLinkedList(arr) {
    if (!arr || arr.length === 0) return null;
    
    const dummy = new ListNode(0);
    let current = dummy;
    
    for (const val of arr) {
        current.next = new ListNode(val);
        current = current.next;
    }
    
    return dummy.next;
}

function serializeLinkedList(head) {
    const result = [];
    let current = head;
    
    while (current !== null) {
        result.push(current.val);
        current = current.next;
    }
    
    return result;
}

function parseInput(data, inputType) {
    if (inputType === 'tree') return deserializeTree(data);
    if (inputType === 'linked_list') return deserializeLinkedList(data);
    return data;
}

function serializeOutput(data, outputType) {
    if (outputType === 'tree') return serializeTree(data);
    if (outputType === 'linked_list') return serializeLinkedList(data);
    return data;
}
`,
            executor: `
(function executeTest() {
    try {
        const testInput = JSON.parse(\`{{TEST_INPUT}}\`);
        const expectedOutput = JSON.parse(\`{{EXPECTED_OUTPUT}}\`);
        const inputTypes = JSON.parse(\`{{INPUT_TYPES}}\`);
        const outputType = \`{{OUTPUT_TYPE}}\`;
        
        // Parse inputs
        const parsedInputs = Array.isArray(inputTypes)
            ? inputTypes.map((type, i) => parseInput(testInput[i], type))
            : [parseInput(testInput, inputTypes)];
        
        // Execute user solution
        const actualOutput = {{FUNCTION_NAME}}(...parsedInputs);
        
        // Serialize output
        const serializedOutput = serializeOutput(actualOutput, outputType);
        
        console.log(JSON.stringify({
            status: "SUCCESS",
            output: serializedOutput,
            expected: expectedOutput
        }));
        
    } catch (error) {
        console.log(JSON.stringify({
            status: "ERROR",
            error: error.message,
            stack: error.stack
        }));
    }
})();
`
        }
    };

    /**
     * Inject test harness into user code
     * 
     * @param {Object} params - Injection parameters
     * @returns {string} Complete code with test harness
     */
    static injectTestHarness({
        userCode,
        language,
        functionName,
        testInput,
        expectedOutput,
        inputTypes,
        outputType
    }) {
        const template = this.TEMPLATES[language];

        if (!template) {
            throw new Error(`Unsupported language: ${language}`);
        }

        // Prepare template variables
        const variables = {
            TEST_INPUT: JSON.stringify(testInput),
            EXPECTED_OUTPUT: JSON.stringify(expectedOutput),
            INPUT_TYPES: JSON.stringify(inputTypes),
            OUTPUT_TYPE: outputType,
            FUNCTION_NAME: functionName
        };

        // Build complete code
        let completeCode = '';

        // Add imports and data structures
        completeCode += template.imports + '\n\n';

        // Add parsers
        completeCode += template.parsers + '\n\n';

        // Add user code
        completeCode += '# USER CODE\n' + userCode + '\n\n';

        // Add test executor
        let executor = template.executor;
        for (const [key, value] of Object.entries(variables)) {
            executor = executor.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        completeCode += executor;

        return completeCode;
    }

    /**
     * Inject test harness for batch execution
     * 
     * @param {Object} params - Batch injection parameters
     * @returns {string} Complete code with batch test harness
     */
    static injectBatchTestHarness({
        userCode,
        language,
        functionName,
        testCases,
        inputTypes,
        outputType
    }) {
        const template = this.TEMPLATES[language];

        if (!template) {
            throw new Error(`Unsupported language: ${language}`);
        }

        let completeCode = '';

        // Add imports and data structures
        completeCode += template.imports + '\n\n';

        // Add parsers
        completeCode += template.parsers + '\n\n';

        // Add user code
        completeCode += '# USER CODE\n' + userCode + '\n\n';

        // Add batch executor
        if (language === 'python') {
            completeCode += this.generatePythonBatchExecutor({
                functionName,
                testCases,
                inputTypes,
                outputType
            });
        } else if (language === 'javascript') {
            completeCode += this.generateJavaScriptBatchExecutor({
                functionName,
                testCases,
                inputTypes,
                outputType
            });
        }

        return completeCode;
    }

    /**
     * Generate Python batch executor
     */
    static generatePythonBatchExecutor({ functionName, testCases, inputTypes, outputType }) {
        const testCasesJSON = JSON.stringify(testCases);
        const inputTypesJSON = JSON.stringify(inputTypes);

        return `
def execute_batch_tests():
    """Execute multiple test cases"""
    test_cases = json.loads('''${testCasesJSON}''')
    input_types = json.loads('''${inputTypesJSON}''')
    output_type = '''${outputType}'''
    
    results = []
    
    for test_case in test_cases:
        try:
            # Parse inputs
            test_input = test_case['input']
            expected_output = test_case['output']
            
            parsed_inputs = []
            if isinstance(input_types, list):
                for i, input_type in enumerate(input_types):
                    parsed_inputs.append(parse_input(test_input[i], input_type))
            else:
                parsed_inputs = [parse_input(test_input, input_types)]
            
            # Execute solution
            solution = Solution()
            actual_output = solution.${functionName}(*parsed_inputs)
            
            # Serialize output
            serialized_output = serialize_output(actual_output, output_type)
            
            results.append({
                "testCaseId": test_case['id'],
                "status": "SUCCESS",
                "output": serialized_output,
                "expected": expected_output
            })
            
        except Exception as e:
            import traceback
            results.append({
                "testCaseId": test_case['id'],
                "status": "ERROR",
                "error": str(e),
                "traceback": traceback.format_exc()
            })
    
    print(json.dumps({"results": results}))

execute_batch_tests()
`;
    }

    /**
     * Generate JavaScript batch executor
     */
    static generateJavaScriptBatchExecutor({ functionName, testCases, inputTypes, outputType }) {
        const testCasesJSON = JSON.stringify(testCases);
        const inputTypesJSON = JSON.stringify(inputTypes);

        return `
(function executeBatchTests() {
    const testCases = ${testCasesJSON};
    const inputTypes = ${inputTypesJSON};
    const outputType = '${outputType}';
    
    const results = [];
    
    for (const testCase of testCases) {
        try {
            const testInput = testCase.input;
            const expectedOutput = testCase.output;
            
            // Parse inputs
            const parsedInputs = Array.isArray(inputTypes)
                ? inputTypes.map((type, i) => parseInput(testInput[i], type))
                : [parseInput(testInput, inputTypes)];
            
            // Execute solution
            const actualOutput = ${functionName}(...parsedInputs);
            
            // Serialize output
            const serializedOutput = serializeOutput(actualOutput, outputType);
            
            results.push({
                testCaseId: testCase.id,
                status: "SUCCESS",
                output: serializedOutput,
                expected: expectedOutput
            });
            
        } catch (error) {
            results.push({
                testCaseId: testCase.id,
                status: "ERROR",
                error: error.message,
                stack: error.stack
            });
        }
    }
    
    console.log(JSON.stringify({ results }));
})();
`;
    }

    /**
     * Parse execution result and perform semantic comparison
     * 
     * @param {string} output - Raw output from code execution
     * @returns {Object} Parsed result with semantic comparison
     */
    static parseExecutionResult(output) {
        try {
            const result = JSON.parse(output);

            if (result.status === 'ERROR') {
                return {
                    status: 'RUNTIME_ERROR',
                    error: result.error,
                    traceback: result.traceback || result.stack
                };
            }

            // Perform semantic comparison
            const comparison = SemanticValidator.validate(
                result.output,
                result.expected
            );

            return {
                status: comparison.passed ? 'PASSED' : 'WRONG_ANSWER',
                output: result.output,
                expected: result.expected,
                passed: comparison.passed,
                diff: comparison.diff,
                message: comparison.message
            };

        } catch (error) {
            return {
                status: 'INTERNAL_ERROR',
                error: `Failed to parse execution result: ${error.message}`
            };
        }
    }

    /**
     * Parse batch execution result
     */
    static parseBatchExecutionResult(output) {
        try {
            const result = JSON.parse(output);

            return result.results.map(testResult => {
                if (testResult.status === 'ERROR') {
                    return {
                        testCaseId: testResult.testCaseId,
                        status: 'RUNTIME_ERROR',
                        error: testResult.error,
                        traceback: testResult.traceback || testResult.stack
                    };
                }

                // Perform semantic comparison
                const comparison = SemanticValidator.validate(
                    testResult.output,
                    testResult.expected
                );

                return {
                    testCaseId: testResult.testCaseId,
                    status: comparison.passed ? 'PASSED' : 'WRONG_ANSWER',
                    output: testResult.output,
                    expected: testResult.expected,
                    passed: comparison.passed,
                    diff: comparison.diff,
                    message: comparison.message
                };
            });

        } catch (error) {
            throw new Error(`Failed to parse batch execution result: ${error.message}`);
        }
    }
}

module.exports = TestHarnessInjector;
