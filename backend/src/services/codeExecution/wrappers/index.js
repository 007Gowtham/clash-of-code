/**
 * Main Code Wrapper Service
 * Routes to appropriate language wrapper
 * UPDATED: LeetCode style (Class Solution) with block comments
 */

const PythonCodeWrapper = require('./pythonWrapper');
const JavaScriptCodeWrapper = require('./javascriptWrapper');
const CppCodeWrapper = require('./cppWrapper');
const JavaCodeWrapper = require('./javaWrapper');

class CodeWrapperService {
    /**
     * Wrap user code with appropriate language template
     * @param {string} userCode - User's solution code
     * @param {string} language - Programming language (python, javascript, cpp, java)
     * @param {object} problem - Problem details
     * @param {array} testCases - Test cases to execute
     * @returns {string} - Complete executable code
     */
    static wrap(userCode, language, problem, testCases) {
        // Validate inputs
        if (!userCode || typeof userCode !== 'string') {
            throw new Error('Invalid user code provided');
        }

        if (!language) {
            throw new Error('Language not specified');
        }

        if (!problem) {
            throw new Error('Problem details not provided');
        }

        if (!testCases || !Array.isArray(testCases)) {
            throw new Error('Test cases not provided');
        }

        // Route to appropriate wrapper
        switch (language.toLowerCase()) {
            case 'python':
                return PythonCodeWrapper.wrap(userCode, problem, testCases);

            case 'javascript':
            case 'js':
                return JavaScriptCodeWrapper.wrap(userCode, problem, testCases);

            case 'cpp':
            case 'c++':
                return CppCodeWrapper.wrap(userCode, problem, testCases);

            case 'java':
                return JavaCodeWrapper.wrap(userCode, problem, testCases);

            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }

    /**
     * Get starter code template for a problem
     * @param {string} language - Programming language
     * @param {object} problem - Problem details
     * @returns {string} - Starter code template
     */
    static getStarterCode(language, problem) {
        const { functionName, functionSignature, inputType, outputType } = problem;

        // Parse types
        const inputTypes = inputType ? inputType.split(',').map(t => t.trim()) : [];
        const needsListNode = inputTypes.some(t => t.includes('linked_list')) || outputType?.includes('linked_list');
        const needsTreeNode = inputTypes.some(t => t.includes('tree')) || outputType?.includes('tree');

        switch (language.toLowerCase()) {
            case 'python':
                return this.getPythonStarterCode(functionName, functionSignature, needsListNode, needsTreeNode);

            case 'javascript':
            case 'js':
                return this.getJavaScriptStarterCode(functionName, functionSignature, needsListNode, needsTreeNode);

            case 'cpp':
            case 'c++':
                return this.getCppStarterCode(functionName, functionSignature, needsListNode, needsTreeNode);

            case 'java':
                return this.getJavaStarterCode(functionName, functionSignature, needsListNode, needsTreeNode);

            default:
                return '// Starter code not available for this language';
        }
    }

    static getPythonStarterCode(functionName, signature, needsListNode, needsTreeNode) {
        let code = '';

        if (needsListNode) {
            code += `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

`;
        }

        if (needsTreeNode) {
            code += `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

`;
        }

        const params = signature?.params ? signature.params.map(p => p.name).join(', ') : '';
        code += `class Solution:
    def ${functionName || 'solve'}(self${params ? ', ' + params : ''})${signature?.returnType ? ' -> ' + signature.returnType : ''}:
        # Write your solution here
        pass
`;

        return code;
    }

    static getJavaScriptStarterCode(functionName, signature, needsListNode, needsTreeNode) {
        let code = '';

        if (needsListNode) {
            code += `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

`;
        }

        if (needsTreeNode) {
            code += `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

`;
        }

        const params = signature?.params ? signature.params.map(p => p.name).join(', ') : '';
        const paramsDoc = signature?.params ? signature.params.map(p => ` * @param {${p.type || 'type'}} ${p.name}`).join('\n') : '';

        code += `/**
${paramsDoc}
 * @return {${signature?.returnType || 'type'}}
 */
var ${functionName || 'solve'} = function(${params}) {
    // Write your solution here
    
};
`;

        return code;
    }

    static getCppStarterCode(functionName, signature, needsListNode, needsTreeNode) {
        let code = '';

        if (needsListNode) {
            code += `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */

`;
        }

        if (needsTreeNode) {
            code += `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */

`;
        }

        const returnType = signature?.returnType || 'vector<int>';
        const params = signature?.params ? signature.params.map(p => `${p.type} ${p.name}`).join(', ') : '';

        code += `class Solution {
public:
    ${returnType} ${functionName || 'solve'}(${params}) {
        
    }
};
`;

        return code;
    }

    static getJavaStarterCode(functionName, signature, needsListNode, needsTreeNode) {
        let code = '';

        if (needsListNode) {
            code += `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */

`;
        }

        if (needsTreeNode) {
            code += `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */

`;
        }

        // Clean types for Java (remove pointers)
        const returnType = signature?.returnType ? signature.returnType.replace(/\*/g, '') : 'void';
        const params = signature?.params ? signature.params.map(p => `${p.type.replace(/\*/g, '')} ${p.name}`).join(', ') : '';

        code += `class Solution {
    public ${returnType} ${functionName || 'solve'}(${params}) {
        
    }
}
`;

        return code;
    }
}

module.exports = CodeWrapperService;
