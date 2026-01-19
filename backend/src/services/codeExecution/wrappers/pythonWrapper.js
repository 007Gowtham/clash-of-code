/**
 * Python Code Wrapper
 * Wraps user's solution code with data structures, helpers, and test harness
 */

class PythonCodeWrapper {
    /**
     * Wrap user code with complete executable template
     * @param {string} userCode - User's solution code
     * @param {object} problem - Problem details (functionName, inputType, outputType, etc.)
     * @param {array} testCases - Test cases to execute
     * @returns {string} - Complete executable Python code
     */
    static wrap(userCode, problem, testCases) {
        const { functionName, inputType, outputType, functionSignature } = problem;

        // Parse input/output types
        const inputTypes = inputType ? inputType.split(',').map(t => t.trim()) : [];
        const needsListNode = inputTypes.some(t => t.includes('linked_list')) || outputType?.includes('linked_list');
        const needsTreeNode = inputTypes.some(t => t.includes('tree')) || outputType?.includes('tree');

        let code = '';

        // Add imports
        code += this.getImports();

        // Add data structure definitions if needed
        if (needsListNode) {
            code += this.getListNodeDefinition();
        }
        if (needsTreeNode) {
            code += this.getTreeNodeDefinition();
        }

        // Add helper functions
        code += this.getHelperFunctions(needsListNode, needsTreeNode);

        // Add user code
        code += '\n# User Solution Code\n';
        code += userCode;
        code += '\n\n';

        // Add main execution
        code += this.getMainExecution(functionName, inputTypes, outputType, testCases);

        return code;
    }

    static getImports() {
        return `from typing import Optional, List, Dict, Set, Tuple
import json
import sys
from collections import defaultdict, deque

`;
    }

    static getListNodeDefinition() {
        return `# Definition for singly-linked list
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

`;
    }

    static getTreeNodeDefinition() {
        return `# Definition for a binary tree node
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

`;
    }

    static getHelperFunctions(needsListNode, needsTreeNode) {
        let helpers = '';

        if (needsListNode) {
            helpers += `def create_linked_list(arr):
    """Create linked list from array"""
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for val in arr[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

def linked_list_to_array(head):
    """Convert linked list to array"""
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

`;
        }

        if (needsTreeNode) {
            helpers += `def create_tree(arr):
    """Create binary tree from level-order array (None for null nodes)"""
    if not arr or arr[0] is None:
        return None
    
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    
    while queue and i < len(arr):
        node = queue.popleft()
        
        # Left child
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        
        # Right child
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    
    return root

def tree_to_array(root):
    """Convert binary tree to level-order array"""
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    
    # Remove trailing None values
    while result and result[-1] is None:
        result.pop()
    
    return result

`;
        }

        return helpers;
    }

    static getMainExecution(functionName, inputTypes, outputType, testCases) {
        return `if __name__ == "__main__":
    solution = Solution()
    results = []
    
    # Test cases
    test_cases = ${JSON.stringify(testCases, null, 4)}
    
    for test_case in test_cases:
        try:
            # Parse inputs
            inputs = test_case.get('input', [])
            expected_output = test_case.get('output')
            
            # Convert inputs based on types
            parsed_inputs = []
            ${this.generateInputParsing(inputTypes)}
            
            # Execute solution
            import time
            start_time = time.time()
            result = solution.${functionName}(*parsed_inputs)
            execution_time = (time.time() - start_time) * 1000  # Convert to ms
            
            # Convert output based on type
            ${this.generateOutputConversion(outputType)}
            
            # Compare with expected
            passed = actual_output == expected_output
            
            results.append({
                'testCaseId': test_case.get('id'),
                'status': 'PASSED' if passed else 'FAILED',
                'input': str(inputs),
                'expectedOutput': str(expected_output),
                'actualOutput': str(actual_output),
                'executionTime': round(execution_time, 2),
                'memory': 0  # Python memory tracking is complex
            })
            
        except Exception as e:
            results.append({
                'testCaseId': test_case.get('id'),
                'status': 'ERROR',
                'input': str(inputs) if 'inputs' in locals() else '',
                'expectedOutput': str(expected_output) if 'expected_output' in locals() else '',
                'actualOutput': '',
                'error': str(e),
                'executionTime': 0,
                'memory': 0
            })
    
    # Output results as JSON
    print(json.dumps(results))
`;
    }

    static generateInputParsing(inputTypes) {
        let parsing = '';

        inputTypes.forEach((type, index) => {
            if (type.includes('linked_list')) {
                parsing += `            if ${index} < len(inputs):
                parsed_inputs.append(create_linked_list(inputs[${index}]))
`;
            } else if (type.includes('tree')) {
                parsing += `            if ${index} < len(inputs):
                parsed_inputs.append(create_tree(inputs[${index}]))
`;
            } else if (type.includes('array') || type.includes('list')) {
                parsing += `            if ${index} < len(inputs):
                parsed_inputs.append(inputs[${index}])
`;
            } else {
                // Default: primitive type
                parsing += `            if ${index} < len(inputs):
                parsed_inputs.append(inputs[${index}])
`;
            }
        });

        return parsing || '            parsed_inputs = inputs';
    }

    static generateOutputConversion(outputType) {
        if (outputType?.includes('linked_list')) {
            return `            actual_output = linked_list_to_array(result)`;
        } else if (outputType?.includes('tree')) {
            return `            actual_output = tree_to_array(result)`;
        } else {
            return `            actual_output = result`;
        }
    }
}

module.exports = PythonCodeWrapper;
