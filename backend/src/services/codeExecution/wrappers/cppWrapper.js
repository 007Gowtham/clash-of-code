/**
 * C++ Code Wrapper
 * Wraps user's solution code with data structures, helpers, and test harness
 */

class CppCodeWrapper {
    /**
     * Wrap user code with complete executable template
     * @param {string} userCode - User's solution code
     * @param {object} problem - Problem details
     * @param {array} testCases - Test cases to execute
     * @returns {string} - Complete executable C++ code
     */
    static wrap(userCode, problem, testCases) {
        const { functionName, inputType, outputType } = problem;

        // Parse input/output types
        const inputTypes = inputType ? inputType.split(',').map(t => t.trim()) : [];
        const needsListNode = inputTypes.some(t => t.includes('linked_list')) || outputType?.includes('linked_list');
        const needsTreeNode = inputTypes.some(t => t.includes('tree')) || outputType?.includes('tree');

        let code = '';

        // Add includes
        code += this.getIncludes();

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

    static getIncludes() {
        return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <climits>
using namespace std;

`;
    }

    static getListNodeDefinition() {
        return `// Definition for singly-linked list
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

`;
    }

    static getTreeNodeDefinition() {
        return `// Definition for a binary tree node
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

`;
    }

    static getHelperFunctions(needsListNode, needsTreeNode) {
        let helpers = '';

        if (needsListNode) {
            helpers += `// Create linked list from vector
ListNode* createLinkedList(const vector<int>& arr) {
    if (arr.empty()) return nullptr;
    
    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
    
    for (size_t i = 1; i < arr.size(); i++) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }
    
    return head;
}

// Convert linked list to vector
vector<int> linkedListToVector(ListNode* head) {
    vector<int> result;
    while (head) {
        result.push_back(head->val);
        head = head->next;
    }
    return result;
}

// Delete linked list to free memory
void deleteLinkedList(ListNode* head) {
    while (head) {
        ListNode* temp = head;
        head = head->next;
        delete temp;
    }
}

`;
        }

        if (needsTreeNode) {
            helpers += `// Create binary tree from level-order vector (INT_MIN for null)
TreeNode* createTree(const vector<int>& arr) {
    if (arr.empty() || arr[0] == INT_MIN) return nullptr;
    
    TreeNode* root = new TreeNode(arr[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    
    while (!q.empty() && i < arr.size()) {
        TreeNode* node = q.front();
        q.pop();
        
        // Left child
        if (i < arr.size() && arr[i] != INT_MIN) {
            node->left = new TreeNode(arr[i]);
            q.push(node->left);
        }
        i++;
        
        // Right child
        if (i < arr.size() && arr[i] != INT_MIN) {
            node->right = new TreeNode(arr[i]);
            q.push(node->right);
        }
        i++;
    }
    
    return root;
}

// Convert binary tree to level-order vector
vector<int> treeToVector(TreeNode* root) {
    vector<int> result;
    if (!root) return result;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        
        if (node) {
            result.push_back(node->val);
            q.push(node->left);
            q.push(node->right);
        } else {
            result.push_back(INT_MIN);
        }
    }
    
    // Remove trailing INT_MIN values
    while (!result.empty() && result.back() == INT_MIN) {
        result.pop_back();
    }
    
    return result;
}

// Delete tree to free memory
void deleteTree(TreeNode* root) {
    if (!root) return;
    deleteTree(root->left);
    deleteTree(root->right);
    delete root;
}

`;
        }

        // Add JSON parsing helpers
        helpers += `// Helper to parse JSON array
vector<int> parseIntArray(const string& str) {
    vector<int> result;
    stringstream ss(str);
    char ch;
    int num;
    
    ss >> ch; // skip '['
    while (ss >> num) {
        result.push_back(num);
        ss >> ch; // skip ',' or ']'
    }
    
    return result;
}

// Helper to convert vector to JSON string
string vectorToJson(const vector<int>& vec) {
    if (vec.empty()) return "[]";
    
    stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); i++) {
        if (i > 0) ss << ",";
        if (vec[i] == INT_MIN) ss << "null";
        else ss << vec[i];
    }
    ss << "]";
    return ss.str();
}

`;

        return helpers;
    }

    static getMainExecution(functionName, inputTypes, outputType, testCases) {
        // Escape test cases JSON for C++ string
        const testCasesJson = JSON.stringify(testCases).replace(/"/g, '\\"');

        return `int main() {
    Solution solution;
    
    // Test cases (in real implementation, read from stdin)
    string testCasesJson = R"(${testCasesJson})";
    
    cout << "[" << endl;
    
    ${this.generateTestCaseLoop(functionName, inputTypes, outputType, testCases)}
    
    cout << "]" << endl;
    
    return 0;
}
`;
    }

    static generateTestCaseLoop(functionName, inputTypes, outputType, testCases) {
        let code = '';

        testCases.forEach((testCase, index) => {
            const inputs = testCase.input || [];
            const expectedOutput = testCase.output;

            code += `    // Test case ${index + 1}\n`;
            code += `    {\n`;

            // Parse inputs
            inputTypes.forEach((type, i) => {
                if (type.includes('linked_list')) {
                    code += `        vector<int> input${i} = ${JSON.stringify(inputs[i] || [])};\n`;
                    code += `        ListNode* list${i} = createLinkedList(input${i});\n`;
                } else if (type.includes('tree')) {
                    code += `        vector<int> input${i} = ${JSON.stringify(inputs[i] || [])};\n`;
                    code += `        TreeNode* tree${i} = createTree(input${i});\n`;
                } else if (type.includes('array') || type.includes('vector')) {
                    code += `        vector<int> input${i} = ${JSON.stringify(inputs[i] || [])};\n`;
                } else {
                    code += `        int input${i} = ${inputs[i] || 0};\n`;
                }
            });

            // Call solution
            const args = inputTypes.map((type, i) => {
                if (type.includes('linked_list')) return `list${i}`;
                if (type.includes('tree')) return `tree${i}`;
                return `input${i}`;
            }).join(', ');

            code += `        \n`;
            code += `        auto result = solution.${functionName}(${args});\n`;
            code += `        \n`;

            // Convert result
            if (outputType?.includes('linked_list')) {
                code += `        vector<int> actualOutput = linkedListToVector(result);\n`;
            } else if (outputType?.includes('tree')) {
                code += `        vector<int> actualOutput = treeToVector(result);\n`;
            } else if (outputType?.includes('array') || outputType?.includes('vector')) {
                code += `        vector<int> actualOutput = result;\n`;
            } else {
                code += `        int actualOutput = result;\n`;
            }

            // Output result
            code += `        vector<int> expectedOutput = ${JSON.stringify(expectedOutput)};\n`;
            code += `        bool passed = (actualOutput == expectedOutput);\n`;
            code += `        \n`;
            code += `        if (${index} > 0) cout << "," << endl;\n`;
            code += `        cout << "{\\"testCaseId\\":\\"${testCase.id}\\",\\"status\\":\\"" << (passed ? "PASSED" : "FAILED") << "\\",\\"actualOutput\\":" << vectorToJson(actualOutput) << ",\\"expectedOutput\\":" << vectorToJson(expectedOutput) << "}";\n`;

            // Cleanup
            inputTypes.forEach((type, i) => {
                if (type.includes('linked_list')) {
                    code += `        deleteLinkedList(list${i});\n`;
                } else if (type.includes('tree')) {
                    code += `        deleteTree(tree${i});\n`;
                }
            });

            if (outputType?.includes('linked_list')) {
                code += `        deleteLinkedList(result);\n`;
            } else if (outputType?.includes('tree')) {
                code += `        deleteTree(result);\n`;
            }

            code += `    }\n\n`;
        });

        return code;
    }
}

module.exports = CppCodeWrapper;
