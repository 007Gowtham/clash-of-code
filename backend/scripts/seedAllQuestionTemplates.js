const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAllQuestionTemplates() {
    console.log('🌱 Seeding All Question Templates for All Languages...\n');

    try {
        // Get all questions
        const questions = await prisma.question.findMany({
            select: {
                id: true,
                slug: true,
                title: true,
                functionName: true,
                functionSignature: true,
                inputType: true,
                outputType: true
            }
        });

        console.log(`📚 Found ${questions.length} questions\n`);

        for (const question of questions) {
            console.log(`\n📝 Processing: ${question.title} (${question.slug})`);

            const funcSig = question.functionSignature ? JSON.parse(question.functionSignature) : null;
            const inputType = question.inputType || '';
            const outputType = question.outputType || '';

            // Determine if we need special data structures
            const needsTreeNode = inputType.includes('tree') || outputType.includes('tree');
            const needsListNode = inputType.includes('linked_list') || outputType.includes('linked_list');

            // Generate templates for each language
            await generateCppTemplate(question, funcSig, needsTreeNode, needsListNode);
            await generateJavaTemplate(question, funcSig, needsTreeNode, needsListNode);
            await generatePythonTemplate(question, funcSig, needsTreeNode, needsListNode);
            await generateJavaScriptTemplate(question, funcSig, needsTreeNode, needsListNode);

            console.log(`  ✅ Generated templates for all languages`);
        }

        console.log('\n\n✅ All question templates seeded successfully!\n');

    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// C++ TEMPLATE GENERATOR
// ============================================================================
async function generateCppTemplate(question, funcSig, needsTreeNode, needsListNode) {
    let headerCode = '';

    // Add TreeNode definition if needed
    if (needsTreeNode) {
        headerCode += `/**
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

    // Add ListNode definition if needed
    if (needsListNode) {
        headerCode += `/**
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

    // Generate starter code (Solution class)
    const returnType = funcSig?.returnType || 'int';
    const params = funcSig?.params || [];
    const paramStr = params.map(p => `${p.type} ${p.name}`).join(', ');

    const starterCode = `class Solution {
public:
    ${returnType} ${question.functionName}(${paramStr}) {
        
    }
};`;

    // Generate driver code (main function)
    const driverCode = generateCppDriver(question, funcSig, needsTreeNode, needsListNode);

    // Upsert to database
    await prisma.questionTemplate.upsert({
        where: {
            questionId_language: {
                questionId: question.id,
                language: 'cpp'
            }
        },
        update: {
            headerCode,
            starterCode,
            driverCode
        },
        create: {
            questionId: question.id,
            language: 'cpp',
            headerCode,
            starterCode,
            driverCode
        }
    });
}

function generateCppDriver(question, funcSig, needsTreeNode, needsListNode) {
    let driver = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <algorithm>
#include <climits>

using namespace std;

`;

    // Add helper functions for tree/list if needed
    if (needsTreeNode) {
        driver += `// Helper: Parse tree from string like "[1,null,2,3]"
TreeNode* stringToTreeNode(string input) {
    if (input.empty() || input == "[]") return nullptr;
    
    input = input.substr(1, input.length() - 2);
    if (input.empty()) return nullptr;

    stringstream ss(input);
    string item;
    getline(ss, item, ',');
    
    TreeNode* root = new TreeNode(stoi(item));
    queue<TreeNode*> q;
    q.push(root);

    while(true) {
        TreeNode* node = q.front();
        q.pop();

        if (!getline(ss, item, ',')) break;
        item.erase(0, item.find_first_not_of(" "));
        if (item != "null") {
            node->left = new TreeNode(stoi(item));
            q.push(node->left);
        }

        if (!getline(ss, item, ',')) break;
        item.erase(0, item.find_first_not_of(" "));
        if (item != "null") {
            node->right = new TreeNode(stoi(item));
            q.push(node->right);
        }
    }
    return root;
}

string treeToString(TreeNode* root) {
    if (!root) return "[]";
    string result = "[";
    queue<TreeNode*> q;
    q.push(root);
    bool first = true;
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        if (!first) result += ",";
        first = false;
        if (node) {
            result += to_string(node->val);
            q.push(node->left);
            q.push(node->right);
        } else {
            result += "null";
        }
    }
    result += "]";
    return result;
}

`;
    }

    if (needsListNode) {
        driver += `// Helper: Parse list from string like "[1,2,3]"
ListNode* stringToListNode(string input) {
    if (input.empty() || input == "[]") return nullptr;
    
    input = input.substr(1, input.length() - 2);
    stringstream ss(input);
    string item;
    
    ListNode* dummy = new ListNode(0);
    ListNode* current = dummy;
    
    while (getline(ss, item, ',')) {
        item.erase(0, item.find_first_not_of(" "));
        current->next = new ListNode(stoi(item));
        current = current->next;
    }
    
    return dummy->next;
}

string listToString(ListNode* head) {
    if (!head) return "[]";
    string result = "[";
    bool first = true;
    while (head) {
        if (!first) result += ",";
        first = false;
        result += to_string(head->val);
        head = head->next;
    }
    result += "]";
    return result;
}

`;
    }

    // Add vector helpers
    driver += `string vectorToString(vector<int> list) {
    if (list.empty()) return "[]";
    string result = "[";
    for(int i = 0; i < list.size(); i++) {
        result += to_string(list[i]);
        if (i < list.size() - 1) result += ",";
    }
    result += "]";
    return result;
}

vector<int> stringToVector(string input) {
    vector<int> result;
    if (input.empty() || input == "[]") return result;
    
    input = input.substr(1, input.length() - 2);
    stringstream ss(input);
    string item;
    
    while (getline(ss, item, ',')) {
        item.erase(0, item.find_first_not_of(" "));
        result.push_back(stoi(item));
    }
    
    return result;
}

int main() {
    string line;
    getline(cin, line);
    
    Solution sol;
`;

    // Parse input and call solution based on function signature
    const params = funcSig?.params || [];
    const returnType = funcSig?.returnType || 'int';

    // Parse each parameter
    params.forEach((param, idx) => {
        if (param.type.includes('TreeNode')) {
            driver += `    TreeNode* param${idx} = stringToTreeNode(line);\n`;
        } else if (param.type.includes('ListNode')) {
            driver += `    ListNode* param${idx} = stringToListNode(line);\n`;
        } else if (param.type.includes('vector')) {
            driver += `    vector<int> param${idx} = stringToVector(line);\n`;
        } else if (param.type === 'int') {
            driver += `    int param${idx} = stoi(line);\n`;
        } else if (param.type === 'string') {
            driver += `    string param${idx} = line;\n`;
        }
    });

    // Call the solution
    const paramNames = params.map((_, idx) => `param${idx}`).join(', ');
    driver += `    auto result = sol.${question.functionName}(${paramNames});\n    \n`;

    // Output the result
    if (returnType.includes('TreeNode')) {
        driver += `    cout << treeToString(result) << endl;\n`;
    } else if (returnType.includes('ListNode')) {
        driver += `    cout << listToString(result) << endl;\n`;
    } else if (returnType.includes('vector')) {
        driver += `    cout << vectorToString(result) << endl;\n`;
    } else if (returnType === 'int') {
        driver += `    cout << result << endl;\n`;
    } else if (returnType === 'bool') {
        driver += `    cout << (result ? "true" : "false") << endl;\n`;
    } else if (returnType === 'string') {
        driver += `    cout << result << endl;\n`;
    }

    driver += `    return 0;\n}\n`;

    return driver;
}

// ============================================================================
// JAVA TEMPLATE GENERATOR
// ============================================================================
async function generateJavaTemplate(question, funcSig, needsTreeNode, needsListNode) {
    let headerCode = '';

    if (needsTreeNode) {
        headerCode += `/**
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

    if (needsListNode) {
        headerCode += `/**
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

    const returnType = convertTypeToJava(funcSig?.returnType || 'int');
    const params = funcSig?.params || [];
    const paramStr = params.map(p => `${convertTypeToJava(p.type)} ${p.name}`).join(', ');

    const starterCode = `class Solution {
    public ${returnType} ${question.functionName}(${paramStr}) {
        
    }
}`;

    const driverCode = `// Java driver code would go here
// For now, using simple main
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Input parsing and execution
    }
}`;

    await prisma.questionTemplate.upsert({
        where: {
            questionId_language: {
                questionId: question.id,
                language: 'java'
            }
        },
        update: { headerCode, starterCode, driverCode },
        create: {
            questionId: question.id,
            language: 'java',
            headerCode,
            starterCode,
            driverCode
        }
    });
}

function convertTypeToJava(type) {
    const typeMap = {
        'vector<int>': 'int[]',
        'vector<vector<int>>': 'int[][]',
        'TreeNode*': 'TreeNode',
        'ListNode*': 'ListNode',
        'int': 'int',
        'bool': 'boolean',
        'string': 'String'
    };
    return typeMap[type] || type;
}

// ============================================================================
// PYTHON TEMPLATE GENERATOR
// ============================================================================
async function generatePythonTemplate(question, funcSig, needsTreeNode, needsListNode) {
    let headerCode = '';

    if (needsTreeNode) {
        headerCode += `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

`;
    }

    if (needsListNode) {
        headerCode += `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

`;
    }

    const params = funcSig?.params || [];
    const paramStr = params.map(p => p.name).join(', ');

    const starterCode = `class Solution:
    def ${question.functionName}(self, ${paramStr}):
        pass`;

    const driverCode = `# Python driver code
if __name__ == "__main__":
    import sys
    sol = Solution()
    # Input parsing and execution
`;

    await prisma.questionTemplate.upsert({
        where: {
            questionId_language: {
                questionId: question.id,
                language: 'python'
            }
        },
        update: { headerCode, starterCode, driverCode },
        create: {
            questionId: question.id,
            language: 'python',
            headerCode,
            starterCode,
            driverCode
        }
    });
}

// ============================================================================
// JAVASCRIPT TEMPLATE GENERATOR
// ============================================================================
async function generateJavaScriptTemplate(question, funcSig, needsTreeNode, needsListNode) {
    let headerCode = '';

    if (needsTreeNode) {
        headerCode += `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

`;
    }

    if (needsListNode) {
        headerCode += `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

`;
    }

    const params = funcSig?.params || [];
    const paramStr = params.map(p => p.name).join(', ');

    const starterCode = `/**
 * @param ${params.map(p => `{${p.type}} ${p.name}`).join('\n * @param ')}
 * @return {${funcSig?.returnType || 'number'}}
 */
var ${question.functionName} = function(${paramStr}) {
    
};`;

    const driverCode = `// JavaScript driver code
// Input parsing and execution
`;

    await prisma.questionTemplate.upsert({
        where: {
            questionId_language: {
                questionId: question.id,
                language: 'javascript'
            }
        },
        update: { headerCode, starterCode, driverCode },
        create: {
            questionId: question.id,
            language: 'javascript',
            headerCode,
            starterCode,
            driverCode
        }
    });
}

// Run the seeding
seedAllQuestionTemplates();
