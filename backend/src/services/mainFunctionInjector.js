/**
 * Main Function Injector
 * Wraps user's solution code with hidden main function for test execution
 * This is what makes it work like LeetCode - users only write the solution!
 */

const { DataStructureParsers } = require('../utils/dataStructureParsers');

class MainFunctionInjector {
    /**
     * Inject hidden main function that executes user's solution
     * @param {Object} params - Injection parameters
     * @returns {string} Complete executable code
     */
    static injectMainFunction({
        userCode,
        language,
        problem,
        testCase
    }) {
        const injectors = {
            'python': this.injectPythonMain,
            'javascript': this.injectJavaScriptMain,
            'java': this.injectJavaMain,
            'cpp': this.injectCppMain,
        };

        const injector = injectors[language];
        if (!injector) {
            throw new Error(`Unsupported language: ${language}`);
        }

        return injector.call(this, { userCode, problem, testCase });
    }

    /**
     * Inject Python main function
     */
    static injectPythonMain({ userCode, problem, testCase }) {
        let { functionName, inputType, outputType } = problem;

        // Parse inputType if it's a JSON string
        try {
            const parsed = JSON.parse(inputType);
            // Ensure inputs are handled correctly whether array or single string
            inputType = parsed;
        } catch (e) {
            // Keep as is if string (e.g. legacy 'int')
        }

        // Prepare input parsing logic
        const inputParser = this.generateInputParser('python', inputType);
        const outputSerializer = this.generateOutputSerializer('python', outputType);

        return `import json
import sys
from typing import Optional, List, Dict, Any

# ============================================================================
# DATA STRUCTURE DEFINITIONS (Hidden from user)
# ============================================================================

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

# ============================================================================
# INPUT/OUTPUT PARSERS (Hidden from user)
# ============================================================================

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


${inputParser}

${outputSerializer}

# ============================================================================
# USER'S SOLUTION CODE (Auto-wrapped in class Solution if needed)
# ============================================================================

${(() => {
                // Check if user already wrote class Solution
                const hasClassSolution = userCode.match(/class\s+Solution\s*:/);
                if (hasClassSolution) {
                    return userCode;
                }
                // Auto-wrap function in class Solution
                const indentedCode = userCode.split('\n').map(line => '    ' + line).join('\n');
                return `class Solution:\n${indentedCode}`;
            })()}

# ============================================================================
# HIDDEN MAIN FUNCTION (User never sees this!)
# ============================================================================

def main():
    """Execute test case and return result as JSON"""
    try:
        # Parse test input
        test_input = json.loads('''${JSON.stringify(testCase.input)}''')
        expected_output = json.loads('''${JSON.stringify(testCase.output)}''')
        
        # Parse inputs based on problem type
        ${this.generateInputParsing('python', inputType, functionName)}
        
        # Execute user's solution
        solution = Solution()
        actual_output = solution.${functionName}(*parsed_inputs)
        
        # Serialize output for comparison
        serialized_output = serialize_output(actual_output)
        
        # Return result as JSON
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

if __name__ == "__main__":
    main()
`;
    }

    /**
     * Inject JavaScript main function
     */
    static injectJavaScriptMain({ userCode, problem, testCase }) {
        let { functionName, inputType, outputType } = problem;

        // Parse inputType if it's a JSON string
        try {
            const parsed = JSON.parse(inputType);
            inputType = parsed;
        } catch (e) { }

        return `// ============================================================================
// DATA STRUCTURE DEFINITIONS (Hidden from user)
// ============================================================================

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

// ============================================================================
// INPUT/OUTPUT PARSERS (Hidden from user)
// ============================================================================

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

// ============================================================================
// USER'S SOLUTION CODE (Auto-wrapped if needed)
// ============================================================================

${(() => {
                // For JavaScript, functions are standalone, no class wrapping needed
                // Just use the code as-is
                return userCode;
            })()}

// ============================================================================
// HIDDEN MAIN FUNCTION (User never sees this!)
// ============================================================================

(function main() {
    try {
        const testInput = ${JSON.stringify(testCase.input)};
        const expectedOutput = ${JSON.stringify(testCase.output)};
        const inputType = '${inputType}';
        const outputType = '${outputType}';
        
        // Parse inputs
        ${this.generateInputParsing('javascript', inputType, functionName)}
        
        // Execute user's solution
        const actualOutput = ${functionName}(...parsedInputs);
        
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
`;
    }

    /**
     * Generate input parsing logic
     */
    static generateInputParsing(language, inputType, functionName) {
        if (language === 'python') {
            if (Array.isArray(inputType)) {
                // Multiple inputs
                return `parsed_inputs = []
        for i, input_type in enumerate(${JSON.stringify(inputType)}):
            parsed_inputs.append(parse_input(test_input[i], input_type))`;
            } else {
                // Single input
                return `parsed_inputs = [parse_input(test_input, '${inputType}')]`;
            }
        } else if (language === 'javascript') {
            if (Array.isArray(inputType)) {
                return `const parsedInputs = ${JSON.stringify(inputType)}.map((type, i) => 
            parseInput(testInput[i], type)
        );`;
            } else {
                return `const parsedInputs = [parseInput(testInput, inputType)];`;
            }
        }
        return '';
    }

    /**
     * Generate input parser function
     */
    static generateInputParser(language, inputType) {
        if (language === 'python') {
            return `def parse_input(data, input_type):
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
`;
        }
        return '';
    }

    /**
     * Generate output serializer function
     */
    static generateOutputSerializer(language, outputType) {
        if (language === 'python') {
            return `def serialize_output(data):
    """Serialize output based on type"""
    output_type = '${outputType}'
    if output_type == 'tree':
        return serialize_tree(data)
    elif output_type == 'linked_list':
        return serialize_linked_list(data)
    else:
        return data
`;
        }
        return '';
    }

    /**
     * Inject C++ main function
     * Supports basic types and vectors
     * Auto-wraps function-only code in class Solution (LeetCode style)
     */
    static injectCppMain({ userCode, problem, testCase }) {
        // SCENARIO 1: Script Mode (User writes main)
        if (userCode.match(/\bint\s+main\s*\(/)) {
            return userCode;
        }

        // SCENARIO 2: LeetCode Style - Auto-wrap if user only wrote function
        const { functionName = 'solve' } = problem;

        // Check if user already wrote class Solution
        const hasClassSolution = userCode.match(/class\s+Solution\s*\{/);

        // If no class Solution, wrap the user's function in it
        let wrappedUserCode = userCode;
        if (!hasClassSolution) {
            // Auto-wrap: Add class Solution { public: ... }
            wrappedUserCode = `class Solution {
public:
${userCode.split('\n').map(line => '    ' + line).join('\n')}
};`;
        }

        const inputs = Array.isArray(testCase.input) ? testCase.input : [testCase.input];

        // Helper to formatting C++ values
        const formatCppValue = (val) => {
            if (Array.isArray(val)) {
                // Formatting vector: {1, 2, 3}
                const elements = val.map(v => formatCppValue(v)).join(', ');
                return `{${elements}}`;
            }
            if (typeof val === 'string') {
                return `"${val}"`;
            }
            if (typeof val === 'boolean') {
                return val ? 'true' : 'false';
            }
            return String(val);
        };

        // Helper to deduce type
        const deduceType = (val) => {
            if (Array.isArray(val)) {
                if (val.length > 0 && typeof val[0] === 'string') return 'vector<string>';
                if (val.length > 0 && Array.isArray(val[0])) return 'vector<vector<int>>'; // Assuming 2D int array
                return 'vector<int>'; // Default
            }
            if (typeof val === 'string') return 'string';
            if (typeof val === 'boolean') return 'bool';
            return 'int';
        };

        // Parse input types
        let inputTypes = [];
        try {
            inputTypes = JSON.parse(problem.inputType || '[]');
            if (!Array.isArray(inputTypes)) inputTypes = [problem.inputType];
        } catch (e) {
            inputTypes = [problem.inputType || 'int'];
        }

        let inputSetup = '';
        let argNames = [];

        inputs.forEach((val, idx) => {
            const expectedType = inputTypes[idx] || 'unknown';
            const valStr = formatCppValue(val);
            const varName = `arg${idx}`;

            if (expectedType === 'linked_list') {
                if (val === null || (Array.isArray(val) && val.length === 0)) {
                    inputSetup += `    ListNode* ${varName} = nullptr;\n`;
                } else {
                    inputSetup += `    vector<int> vec${idx} = ${valStr};\n`;
                    inputSetup += `    ListNode* ${varName} = vectorToList(vec${idx});\n`;
                }
            } else if (expectedType === 'tree') {
                const treeVecStr = JSON.stringify(val).replace(/\[/g, '{').replace(/\]/g, '}').replace(/null/g, '"null"');
                inputSetup += `    vector<string> vec${idx} = ${treeVecStr};\n`;
                inputSetup += `    TreeNode* ${varName} = vectorToTree(vec${idx});\n`;
            } else if (expectedType === 'array_of_linked_lists') {
                inputSetup += `    vector<ListNode*> ${varName};\n`;
                if (Array.isArray(val)) {
                    val.forEach((innerList, innerIdx) => {
                        const innerValStr = formatCppValue(innerList);
                        inputSetup += `    vector<int> innerVec${idx}_${innerIdx} = ${innerValStr};\n`;
                        inputSetup += `    ${varName}.push_back(vectorToList(innerVec${idx}_${innerIdx}));\n`;
                    });
                }
            } else {
                let cppType = 'int';
                if (Array.isArray(val)) {
                    if (val.length > 0 && typeof val[0] === 'string') cppType = 'vector<string>';
                    else if (val.length > 0 && Array.isArray(val[0])) cppType = 'vector<vector<int>>';
                    else cppType = 'vector<int>';
                } else if (typeof val === 'string') cppType = 'string';
                else if (typeof val === 'boolean') cppType = 'bool';

                inputSetup += `    ${cppType} ${varName} = ${valStr};\n`;
            }
            argNames.push(varName);
        });

        const listNodeDef = /struct\s+ListNode\s*\{/.test(userCode) ? '' : `struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};`;

        const treeNodeDef = /struct\s+TreeNode\s*\{/.test(userCode) ? '' : `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};`;

        return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <sstream>
#include <queue>
#include <stack>

using namespace std;

// Struct Definitions for Linked List and Tree
${listNodeDef}

${treeNodeDef}

// HELPERS
ListNode* vectorToList(const vector<int>& nums) {
    if (nums.empty()) return nullptr;
    ListNode* head = new ListNode(nums[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < nums.size(); ++i) {
        curr->next = new ListNode(nums[i]);
        curr = curr->next;
    }
    return head;
}

TreeNode* vectorToTree(const vector<string>& nodes) {
    if (nodes.empty() || nodes[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(nodes[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < nodes.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < nodes.size() && nodes[i] != "null") {
            curr->left = new TreeNode(stoi(nodes[i]));
            q.push(curr->left);
        }
        i++;
        if (i < nodes.size() && nodes[i] != "null") {
            curr->right = new TreeNode(stoi(nodes[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

// ============================================================================
// USER'S SOLUTION CODE (Auto-wrapped in class Solution if needed)
// ============================================================================

${wrappedUserCode}

// ============================================================================
// HIDDEN MAIN FUNCTION
// ============================================================================

// Helper to print JSON-compatible output
template<typename T>
void print_output(const T& val) {
    cout << val;
}

void print_output(const string& val) {
    cout << "\\"" << val << "\\"";
}

void print_output(bool val) {
    cout << (val ? "true" : "false");
}

template<typename T>
void print_output(const vector<T>& vec) {
    cout << "[";
    for(size_t i = 0; i < vec.size(); ++i) {
        print_output(vec[i]);
        if(i < vec.size() - 1) cout << ",";
    }
    cout << "]";
}

// Special print for ListNode (basic support)
void print_output(ListNode* head) {
    cout << "[";
    ListNode* curr = head;
    while (curr) {
        cout << curr->val;
        if (curr->next) cout << ",";
        curr = curr->next;
    }
    cout << "]";
}

int main() {
    try {
        // Setup Inputs
${inputSetup}

        // Execute Solution
        Solution solution;
        auto result = solution.${functionName}(${argNames.join(', ')});
        
        // Output Result (JSON format)
        cout << "{\\"status\\":\\"SUCCESS\\", \\"output\\":";
        print_output(result);
        cout << "}" << endl;
        
    } catch (...) {
        cout << "{\\"status\\":\\"ERROR\\", \\"error\\":\\"Runtime Error\\"}" << endl;
    }
    return 0;
}
`;
    }

    // Stub Java main for now or leave as is if previously unimplemented
    static injectJavaMain({ userCode, problem, testCase }) {
        const { functionName = 'solve' } = problem;

        // Parse input types
        let inputTypes = [];
        try {
            inputTypes = JSON.parse(problem.inputType || '[]');
            if (!Array.isArray(inputTypes)) inputTypes = [problem.inputType];
        } catch (e) {
            inputTypes = [problem.inputType || 'int'];
        }

        const inputs = Array.isArray(testCase.input) ? testCase.input : [testCase.input];

        // Format values for Java string literals
        const formatJavaValue = (val) => {
            if (val === null) return "null";
            if (Array.isArray(val)) {
                // Java array string representation for our custom parser
                return JSON.stringify(val).replace(/"/g, '\\"');
            }
            if (typeof val === 'string') return `"${val}"`;
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            return String(val);
        };

        let inputSetup = '';
        let argNames = [];

        inputs.forEach((val, idx) => {
            const expectedType = inputTypes[idx] || 'unknown';
            const valStr = formatJavaValue(val);
            const varName = `arg${idx}`;

            // We pass the raw string/json to the helper methods to parse
            if (expectedType === 'linked_list') {
                inputSetup += `        ListNode ${varName} = parseListNode("${valStr}");\n`;
            } else if (expectedType === 'tree') {
                inputSetup += `        TreeNode ${varName} = parseTreeNode("${valStr}");\n`;
            } else if (expectedType === 'array_of_linked_lists') {
                inputSetup += `        ListNode[] ${varName} = parseListNodeArray("${valStr}");\n`;
            } else {
                // Primitive / Standard types
                if (expectedType === 'int[]' || (Array.isArray(val) && typeof val[0] === 'number')) {
                    inputSetup += `        int[] ${varName} = parseIntArray("${valStr}");\n`;
                } else if (expectedType === 'string[]' || (Array.isArray(val) && typeof val[0] === 'string')) {
                    // vector<string> -> String[]
                    inputSetup += `        String[] ${varName} = parseStringArray("${valStr}");\n`;
                } else if (expectedType === 'int[][]') {
                    inputSetup += `        int[][] ${varName} = parseIntMatrix("${valStr}");\n`;
                } else if (expectedType === 'string') {
                    inputSetup += `        String ${varName} = ${valStr};\n`;
                } else if (expectedType === 'bool') {
                    inputSetup += `        boolean ${varName} = ${valStr};\n`;
                } else {
                    inputSetup += `        int ${varName} = ${valStr};\n`;
                }
            }
            argNames.push(varName);
        });

        // Check if user code has 'class Solution'
        let fullUserCode = userCode;
        if (!userCode.includes('class Solution')) {
            fullUserCode = `class Solution {
    ${userCode}
}`;
        }

        const listNodeDef = /class\s+ListNode/.test(userCode) ? '' : `class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}`;

        const treeNodeDef = /class\s+TreeNode/.test(userCode) ? '' : `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}`;

        // Handle void return types
        let executionCode = `Object result = solution.${functionName}(${argNames.join(', ')});
            System.out.println("{\\"status\\":\\"SUCCESS\\", \\"output\\":" + parseOutput(result) + "}");`;

        if (problem.outputType === 'void') {
            executionCode = `solution.${functionName}(${argNames.join(', ')});
            System.out.println("{\\"status\\":\\"SUCCESS\\", \\"output\\":null}");`;
        }

        return `import java.util.*;
import java.io.*;

// Data Structures
${listNodeDef}

${treeNodeDef}

${fullUserCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution solution = new Solution();
            
${inputSetup}
            
            // Execute
            ${executionCode}
            
        } catch (Exception e) {
            System.out.println("{\\"status\\":\\"ERROR\\", \\"error\\":\\"" + e.getMessage() + "\\" }");
            e.printStackTrace();
        }
    }

    // --- PARSING HELPERS (Minimal JSON Parser) ---

    // [1,2,3] -> int[]
    private static int[] parseIntArray(String s) {
        if (s.equals("null") || s.equals("[]")) return new int[0];
        s = s.replace("[", "").replace("]", "");
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] res = new int[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = Integer.parseInt(parts[i].trim());
        return res;
    }
    
    // [[1,2],[3]] -> int[][]
    private static int[][] parseIntMatrix(String s) {
        if (s.equals("null") || s.equals("[]")) return new int[0][0];
        s = s.trim();
        // Remove outer brackets
        s = s.substring(1, s.length() - 1);
        List<int[]> list = new ArrayList<>();
        
        int start = 0;
        int balance = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '[') balance++;
            if (c == ']') balance--;
            
            if (balance == 0 && (c == ',' || i == s.length() - 1)) {
               int end = (c == ',') ? i : i + 1;
               String part = s.substring(start, end).trim();
               if (!part.isEmpty()) list.add(parseIntArray(part));
               start = i + 1;
            }
        }
        return list.toArray(new int[list.size()][]);
    }
    
    // ["a","b"] -> String[]
    private static String[] parseStringArray(String s) {
         if (s.equals("null") || s.equals("[]")) return new String[0];
         s = s.replace("[", "").replace("]", "").replace("\\"", "");
         return s.split(",");
    }

    // [1,2,3] -> ListNode
    private static ListNode parseListNode(String s) {
        int[] arr = parseIntArray(s);
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for(int i=1; i<arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    // [[1,2], [3]] -> ListNode[]
    private static ListNode[] parseListNodeArray(String s) {
        int[][] arr = parseIntMatrix(s); 
        ListNode[] res = new ListNode[arr.length];
        for(int i=0; i<arr.length; i++) {
             // Convert int[] to ListNode
             if (arr[i].length == 0) {
                 res[i] = null;
             } else {
                 ListNode head = new ListNode(arr[i][0]);
                 ListNode curr = head;
                 for(int k=1; k<arr[i].length; k++) {
                     curr.next = new ListNode(arr[i][k]);
                     curr = curr.next;
                 }
                 res[i] = head;
             }
        }
        return res;
    }

    // [1,null,2] -> TreeNode
    private static TreeNode parseTreeNode(String s) {
        if (s.equals("null") || s.equals("[]")) return null;
        s = s.replace("[", "").replace("]", "").replace("\\"", "");
        String[] parts = s.split(",");
        if (parts.length == 0) return null;
        
        TreeNode root = new TreeNode(Integer.parseInt(parts[0].trim()));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        
        int i = 1;
        while(!q.isEmpty() && i < parts.length) {
            TreeNode curr = q.poll();
            
            if (i < parts.length && !parts[i].trim().equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(parts[i].trim()));
                q.add(curr.left);
            }
            i++;
            if (i < parts.length && !parts[i].trim().equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(parts[i].trim()));
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }

    // Output parsing
    private static String parseOutput(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof Integer || obj instanceof Boolean) return String.valueOf(obj);
        if (obj instanceof String) return "\\"" + obj + "\\"";
        if (obj instanceof int[]) return Arrays.toString((int[])obj).replace(" ", "");
        if (obj instanceof int[][]) return Arrays.deepToString((int[][])obj).replace(" ", "");
        if (obj instanceof Object[]) {
            Object[] arr = (Object[])obj;
            StringBuilder sb = new StringBuilder("[");
            for(int i=0; i<arr.length; i++) {
                sb.append(parseOutput(arr[i]));
                if(i < arr.length-1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof List) {
             List<?> list = (List<?>)obj;
             StringBuilder sb = new StringBuilder("[");
             for(int i=0; i<list.size(); i++) {
                 sb.append(parseOutput(list.get(i)));
                 if(i < list.size()-1) sb.append(",");
             }
             sb.append("]");
             return sb.toString();
        }
        if (obj instanceof ListNode) {
            List<Integer> list = new ArrayList<>();
            ListNode curr = (ListNode)obj;
            while(curr != null) {
                list.add(curr.val);
                curr = curr.next;
            }
            return list.toString().replace(" ", "");
        }
        if (obj instanceof TreeNode) {
            // BFS print
            List<String> res = new ArrayList<>();
            Queue<TreeNode> q = new LinkedList<>();
            q.add((TreeNode)obj);
            while(!q.isEmpty()) {
                TreeNode curr = q.poll();
                if (curr == null) {
                    res.add("null");
                } else {
                    res.add(String.valueOf(curr.val));
                    q.add(curr.left);
                    q.add(curr.right);
                }
            }
            // Trim trailing nulls
            int i = res.size() - 1;
            while(i >= 0 && res.get(i).equals("null")) {
                res.remove(i);
                i--;
            }
            return res.toString().replace(" ", "");
        }
        return String.valueOf(obj);
    }
}`;
    }
}

module.exports = MainFunctionInjector;
