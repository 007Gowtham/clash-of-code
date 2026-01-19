/**
 * JavaScript Code Wrapper
 * Wraps user's solution code with data structures, helpers, and test harness
 */

class JavaScriptCodeWrapper {
    /**
     * Wrap user code with complete executable template
     * @param {string} userCode - User's solution code
     * @param {object} problem - Problem details
     * @param {array} testCases - Test cases to execute
     * @returns {string} - Complete executable JavaScript code
     */
    static wrap(userCode, problem, testCases) {
        const { functionName, inputType, outputType } = problem;

        // Parse input/output types
        const inputTypes = inputType ? inputType.split(',').map(t => t.trim()) : [];
        const needsListNode = inputTypes.some(t => t.includes('linked_list')) || outputType?.includes('linked_list');
        const needsTreeNode = inputTypes.some(t => t.includes('tree')) || outputType?.includes('tree');

        let code = '';

        // Add data structure definitions
        if (needsListNode) {
            code += this.getListNodeDefinition();
        }
        if (needsTreeNode) {
            code += this.getTreeNodeDefinition();
        }

        // Add helper functions
        code += this.getHelperFunctions(needsListNode, needsTreeNode);

        // Add user code
        code += '\n// User Solution Code\n';
        code += userCode;
        code += '\n\n';

        // Add main execution
        code += this.getMainExecution(functionName, inputTypes, outputType, testCases);

        return code;
    }

    static getListNodeDefinition() {
        return `// Definition for singly-linked list
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
}

`;
    }

    static getTreeNodeDefinition() {
        return `// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

`;
    }

    static getHelperFunctions(needsListNode, needsTreeNode) {
        let helpers = '';

        if (needsListNode) {
            helpers += `// Create linked list from array
function createLinkedList(arr) {
    if (!arr || arr.length === 0) return null;
    
    const head = new ListNode(arr[0]);
    let current = head;
    
    for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    
    return head;
}

// Convert linked list to array
function linkedListToArray(head) {
    const result = [];
    let current = head;
    
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    
    return result;
}

`;
        }

        if (needsTreeNode) {
            helpers += `// Create binary tree from level-order array
function createTree(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    
    const root = new TreeNode(arr[0]);
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < arr.length) {
        const node = queue.shift();
        
        // Left child
        if (i < arr.length && arr[i] !== null) {
            node.left = new TreeNode(arr[i]);
            queue.push(node.left);
        }
        i++;
        
        // Right child
        if (i < arr.length && arr[i] !== null) {
            node.right = new TreeNode(arr[i]);
            queue.push(node.right);
        }
        i++;
    }
    
    return root;
}

// Convert binary tree to level-order array
function treeToArray(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        if (node) {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            result.push(null);
        }
    }
    
    // Remove trailing nulls
    while (result.length > 0 && result[result.length - 1] === null) {
        result.pop();
    }
    
    return result;
}

`;
        }

        return helpers;
    }

    static getMainExecution(functionName, inputTypes, outputType, testCases) {
        return `// Main execution
(function main() {
    const results = [];
    const testCases = ${JSON.stringify(testCases, null, 4)};
    
    for (const testCase of testCases) {
        try {
            const inputs = testCase.input || [];
            const expectedOutput = testCase.output;
            
            // Parse inputs based on types
            const parsedInputs = [];
            ${this.generateInputParsing(inputTypes)}
            
            // Execute solution
            const startTime = Date.now();
            const result = ${functionName}(...parsedInputs);
            const executionTime = Date.now() - startTime;
            
            // Convert output based on type
            ${this.generateOutputConversion(outputType)}
            
            // Compare with expected
            const passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
            
            results.push({
                testCaseId: testCase.id,
                status: passed ? 'PASSED' : 'FAILED',
                input: JSON.stringify(inputs),
                expectedOutput: JSON.stringify(expectedOutput),
                actualOutput: JSON.stringify(actualOutput),
                executionTime: executionTime,
                memory: 0  // JavaScript memory tracking is complex
            });
            
        } catch (error) {
            results.push({
                testCaseId: testCase.id,
                status: 'ERROR',
                input: JSON.stringify(testCase.input || []),
                expectedOutput: JSON.stringify(testCase.output || ''),
                actualOutput: '',
                error: error.message,
                executionTime: 0,
                memory: 0
            });
        }
    }
    
    // Output results as JSON
    console.log(JSON.stringify(results));
})();
`;
    }

    static generateInputParsing(inputTypes) {
        let parsing = '';

        inputTypes.forEach((type, index) => {
            if (type.includes('linked_list')) {
                parsing += `            if (${index} < inputs.length) {
                parsedInputs.push(createLinkedList(inputs[${index}]));
            }
`;
            } else if (type.includes('tree')) {
                parsing += `            if (${index} < inputs.length) {
                parsedInputs.push(createTree(inputs[${index}]));
            }
`;
            } else {
                parsing += `            if (${index} < inputs.length) {
                parsedInputs.push(inputs[${index}]);
            }
`;
            }
        });

        return parsing || '            parsedInputs.push(...inputs);';
    }

    static generateOutputConversion(outputType) {
        if (outputType?.includes('linked_list')) {
            return `            const actualOutput = linkedListToArray(result);`;
        } else if (outputType?.includes('tree')) {
            return `            const actualOutput = treeToArray(result);`;
        } else {
            return `            const actualOutput = result;`;
        }
    }
}

module.exports = JavaScriptCodeWrapper;
