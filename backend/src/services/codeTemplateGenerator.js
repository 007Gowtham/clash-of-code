/**
 * Code Template Generator
 * Generates language-specific templates with hidden main functions
 * Users only see and write the solution function
 */

class CodeTemplateGenerator {
    /**
     * Generate code template for a problem
     * @param {Object} problem - Problem configuration
     * @param {string} language - Programming language
     * @returns {string} Code template (what user sees)
     */
    static generateTemplate(problem, language) {
        const generators = {
            'python': this.generatePythonTemplate,
            'javascript': this.generateJavaScriptTemplate,
            'java': this.generateJavaTemplate,
            'cpp': this.generateCppTemplate,
        };

        const generator = generators[language];
        if (!generator) {
            throw new Error(`Unsupported language: ${language}`);
        }

        return generator.call(this, problem);
    }

    /**
     * Generate Python template (LeetCode style)
     */
    static generatePythonTemplate(problem) {
        const { functionName, functionSignature, inputType, description } = problem;

        // Build parameter list with type hints
        const params = functionSignature.params
            .map(p => `${p.name}: ${p.type}`)
            .join(', ');

        const returnType = functionSignature.returnType;

        return `# ${problem.title}
# Difficulty: ${problem.difficulty}
# Points: ${problem.points}

${this.generateDataStructureDefinitions('python', inputType)}

class Solution:
    def ${functionName}(self, ${params}) -> ${returnType}:
        """
        ${description.split('\n')[0]}
        
        Example:
        ${this.generateExampleFromTestCase(problem.testCases[0], 'python')}
        """
        # Write your code here
        pass
`;
    }

    /**
     * Generate JavaScript template
     */
    static generateJavaScriptTemplate(problem) {
        const { functionName, functionSignature, inputType, description } = problem;

        const params = functionSignature.params
            .map(p => p.name)
            .join(', ');

        const paramTypes = functionSignature.params
            .map(p => `{${p.type}} ${p.name}`)
            .join(', ');

        return `// ${problem.title}
// Difficulty: ${problem.difficulty}
// Points: ${problem.points}

${this.generateDataStructureDefinitions('javascript', inputType)}

/**
 * ${description.split('\n')[0]}
 * @param ${paramTypes}
 * @return {${functionSignature.returnType}}
 */
var ${functionName} = function(${params}) {
    // Write your code here
    
};
`;
    }

    /**
     * Generate Java template
     */
    static generateJavaTemplate(problem) {
        const { functionName, functionSignature } = problem;

        const params = functionSignature.params
            .map(p => `${this.convertTypeToJava(p.type)} ${p.name}`)
            .join(', ');

        const returnType = this.convertTypeToJava(functionSignature.returnType);

        return `// ${problem.title}
// Difficulty: ${problem.difficulty}

${this.generateDataStructureDefinitions('java', problem.inputType)}

class Solution {
    public ${returnType} ${functionName}(${params}) {
        // Write your code here
        
    }
}
`;
    }

    /**
     * Generate C++ template
     */
    static generateCppTemplate(problem) {
        const { functionName, functionSignature } = problem;

        const params = functionSignature.params
            .map(p => `${this.convertTypeToCpp(p.type)} ${p.name}`)
            .join(', ');

        const returnType = this.convertTypeToCpp(functionSignature.returnType);

        return `// ${problem.title}
// Difficulty: ${problem.difficulty}

${this.generateDataStructureDefinitions('cpp', problem.inputType)}

class Solution {
public:
    ${returnType} ${functionName}(${params}) {
        // Write your code here
        
    }
};
`;
    }

    /**
     * Generate data structure definitions based on input type
     */
    static generateDataStructureDefinitions(language, inputType) {
        const needsTree = typeof inputType === 'string' ?
            inputType.includes('tree') :
            JSON.stringify(inputType).includes('tree');

        const needsLinkedList = typeof inputType === 'string' ?
            inputType.includes('linked_list') :
            JSON.stringify(inputType).includes('linked_list');

        let definitions = '';

        if (language === 'python') {
            if (needsTree) {
                definitions += `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

`;
            }
            if (needsLinkedList) {
                definitions += `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

`;
            }
        } else if (language === 'javascript') {
            if (needsTree) {
                definitions += `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

`;
            }
            if (needsLinkedList) {
                definitions += `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

`;
            }
        } else if (language === 'cpp') {
            if (needsTree) {
                definitions += `/**
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
            if (needsLinkedList) {
                definitions += `/**
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
        } else if (language === 'java') {
            if (needsTree) {
                definitions += `/**
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
            if (needsLinkedList) {
                definitions += `/**
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
        }

        return definitions;
    }

    /**
     * Generate example from test case
     */
    static generateExampleFromTestCase(testCase, language) {
        if (!testCase) return '';

        const input = JSON.stringify(testCase.input);
        const output = JSON.stringify(testCase.output);

        if (language === 'python') {
            return `Input: ${input}\nOutput: ${output}`;
        }
        return `Input: ${input}, Output: ${output}`;
    }

    /**
     * Type conversion helpers
     */
    static convertTypeToJava(type) {
        const typeMap = {
            'List[int]': 'List<Integer>',
            'List[List[int]]': 'List<List<Integer>>',
            'Optional[TreeNode]': 'TreeNode',
            'int': 'int',
            'boolean': 'boolean',
            'string': 'String',
        };
        return typeMap[type] || type;
    }

    static convertTypeToCpp(type) {
        const typeMap = {
            'List[int]': 'vector<int>',
            'List[List[int]]': 'vector<vector<int>>',
            'Optional[TreeNode]': 'TreeNode*',
            'int': 'int',
            'boolean': 'bool',
            'string': 'string',
        };
        return typeMap[type] || type;
    }
}

module.exports = CodeTemplateGenerator;
