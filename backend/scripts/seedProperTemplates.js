const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProperTemplates() {
    console.log('🌱 Seeding PROPER Templates for ALL Questions in DB...\n');

    try {
        // Get all questions from database
        const dbQuestions = await prisma.question.findMany({
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

        console.log(`📚 Found ${dbQuestions.length} questions in database\n`);

        // Process each question
        for (const question of dbQuestions) {
            console.log(`\n📝 Processing: ${question.title} (${question.slug})`);

            if (!question.functionSignature) {
                console.log(`⚠️  Skipping: Missing functionSignature`);
                continue;
            }

            let funcSig;
            try {
                funcSig = JSON.parse(question.functionSignature);
            } catch (e) {
                console.log(`⚠️  Skipping: Invalid functionSignature JSON`);
                continue;
            }

            // Normalize inputType (handle JSON string or plain string)
            let inputType = question.inputType;
            try {
                if (inputType && (inputType.startsWith('[') || inputType.startsWith('"'))) {
                    inputType = JSON.parse(inputType);
                }
            } catch (e) {
                // keep as string
            }

            const outputType = question.outputType || '';

            // Generate templates for each language
            await generateCppTemplate(question.id, question.functionName, funcSig, inputType, outputType);
            await generateJavaTemplate(question.id, question.functionName, funcSig, inputType, outputType);
            await generatePythonTemplate(question.id, question.functionName, funcSig, inputType, outputType);
            await generateJavaScriptTemplate(question.id, question.functionName, funcSig, inputType, outputType);

            console.log(`  ✅ Generated templates`);
        }

        console.log('\n\n✅ All templates seeded successfully!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// ============================================================================
// C++ TEMPLATE GENERATOR
// ============================================================================

// ... (imports)

async function generateCppTemplate(questionId, functionName, funcSig, inputType, outputType) {
    const inputStr = JSON.stringify(inputType);
    const needsTreeNode = inputStr.includes('tree') || outputType.includes('tree') || funcSig.params.some(p => p.type.includes('TreeNode'));
    const needsListNode = inputStr.includes('linked_list') || outputType.includes('linked_list') || funcSig.params.some(p => p.type.includes('ListNode'));

    // 1. Header Code (Includes)
    const headerCode = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <stack>
#include <unordered_map>
#include <algorithm>
#include <climits>
using namespace std;
`;

    // 2. Boilerplate (Helpers) - User Facing (Commented structs)
    let boilerplate = `// Helpers
`;
    // For boilerplate, we want COMMENTED OUT definitions
    if (needsTreeNode) boilerplate += getCppTreeNodeDef(true); // true = commented
    if (needsListNode) boilerplate += getCppListNodeDef(true); // true = commented

    // Always add standard helpers
    boilerplate += getCppVectorHelpers();
    if (needsTreeNode) boilerplate += getCppTreeHelpers();
    if (needsListNode) boilerplate += getCppListHelpers();

    // 2.5 Definition (Structs) - Execution Facing (Uncommented)
    let definition = ``;
    if (needsTreeNode) definition += getCppTreeNodeDef(false); // false = uncommented
    if (needsListNode) definition += getCppListNodeDef(false); // false = uncommented

    // 3. User Function (Solution Class)
    const returnType = funcSig.returnType;
    const params = funcSig.params.map(p => `${p.type} ${p.name}`).join(', ');

    const userFunction = `class Solution {
public:
    ${returnType} ${functionName}(${params}) {
        
    }
};`;

    // 4. Main Function (Driver)
    const mainFunction = generateCppDriverMainBody(functionName, funcSig, inputType, outputType, needsTreeNode, needsListNode);

    // 5. Diagram
    const diagram = null;

    await prisma.questionTemplate.upsert({
        where: { questionId_language: { questionId, language: 'cpp' } },
        update: { headerCode, boilerplate, userFunction, mainFunction, definition, diagram },
        create: { questionId, language: 'cpp', headerCode, boilerplate, userFunction, mainFunction, definition, diagram }
    });
}
// ... (Helper modifications needed to remove includes from older driver)
// I will rewrite generateCppDriverMainBody to ONLY return the main() { ... } part.

function generateCppDriverMainBody(functionName, funcSig, inputType, outputType, needsTreeNode, needsListNode) {
    let code = `int main() {
    Solution solution;
    string line;
`;

    // ... Input parsing logic ...
    funcSig.params.forEach((param, idx) => {
        code += `    if(!getline(cin, line)) return 0;\n`;
        code += `    // Parse input for ${param.name} (${param.type})\n`;

        let parser = ``;
        const pType = param.type;

        // Exact Type Matching
        if (pType === 'vector<vector<int>>') {
            parser = `    vector<vector<int>> param${idx} = parseMatrix(line);\n`;
        } else if (pType === 'vector<int>') {
            parser = `    vector<int> param${idx} = parseVector(line);\n`;
        } else if (pType === 'TreeNode*') {
            parser = `    vector<int> treeVals${idx} = parseVector(line);\n    TreeNode* param${idx} = buildTree(treeVals${idx});\n`;
        } else if (pType === 'ListNode*') {
            parser = `    vector<int> listVals${idx} = parseVector(line);\n    ListNode* param${idx} = buildList(listVals${idx});\n`;
        } else if (pType === 'vector<ListNode*>') {
            // Special case: Parse as matrix, then convert each row to list
            parser = `    vector<vector<int>> matrix${idx} = parseMatrix(line);\n    vector<ListNode*> param${idx};\n    for(auto& row : matrix${idx}) {\n        param${idx}.push_back(buildList(row));\n    }\n`;
        } else if (pType === 'int') {
            parser = `    int param${idx} = stoi(line);\n`;
        } else if (pType === 'string') {
            parser = `    string param${idx} = line.substr(1, line.length()-2); // Strip quotes\n`;
        } else if (pType === 'bool') {
            parser = `    bool param${idx} = (line == "true");\n`;
        } else {
            // Fallback for simple/unknown params
            parser = `    // Warning: Unknown type ${pType}\n    auto param${idx} = line;\n`;
        }

        code += parser;
    });

    const paramNames = funcSig.params.map((_, i) => `param${i}`).join(', ');
    code += `    
    auto result = solution.${functionName}(${paramNames});\n`;

    // Print Output
    const rType = funcSig.returnType;
    if (rType === 'TreeNode*') {
        code += `    cout << vectorToString(treeToVector(result)) << endl;\n`;
    } else if (rType === 'ListNode*') {
        code += `    cout << vectorToString(listToVector(result)) << endl;\n`;
    } else if (rType === 'vector<vector<int>>') {
        code += `    cout << "[";
    for(int i=0; i<result.size(); i++) {
        if(i>0) cout << ",";
        cout << vectorToString(result[i]);
    }
    cout << "]" << endl;\n`;
    } else if (rType === 'vector<int>') {
        code += `    cout << vectorToString(result) << endl;\n`;
    } else if (rType === 'bool') {
        code += `    cout << (result ? "true" : "false") << endl;\n`;
    } else {
        code += `    cout << result << endl;\n`;
    }

    code += `    return 0;\n}`;
    return code;
}

// ... Java/Python/JS updates similar structure ...
// For brevity in block replacement, I'll update the main loops and CPP logic first.

// NOTE: I need to output the full file content or use careful chunks.
// Given the large changes, I'll rewrite the generation functions in chunks.


function getCppTreeNodeDef(isCommented) {
    if (isCommented) {
        return `/**
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
    } else {
        return `
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
}

function getCppListNodeDef(isCommented) {
    if (isCommented) {
        return `/**
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
    } else {
        return `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
`;
    }
}

function generateCppDriver(functionName, funcSig, inputType, outputType, needsTreeNode, needsListNode) {
    let code = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <stack>
#include <unordered_map>
#include <algorithm>
#include <climits>
using namespace std;

`;

    // Helpers
    code += getCppVectorHelpers(); // Always needed
    if (needsTreeNode) code += getCppTreeHelpers();
    if (needsListNode) code += getCppListHelpers();

    // Main
    code += `int main() {
    Solution solution;
    string line;
`;

    // Parse Inputs
    funcSig.params.forEach((param, idx) => {
        code += `    getline(cin, line);\n`;

        let parser = `    // Unknown type for ${param.name}\n`;

        const pType = param.type;

        if (pType.includes('vector<vector')) {
            parser = `    vector<vector<int>> param${idx} = parseMatrix(line);\n`;
        } else if (pType.includes('vector')) {
            parser = `    vector<int> param${idx} = parseVector(line);\n`;
        } else if (pType.includes('TreeNode')) {
            parser = `    vector<int> treeVals${idx} = parseVector(line);\n    TreeNode* param${idx} = buildTree(treeVals${idx});\n`;
        } else if (pType.includes('ListNode')) {
            parser = `    vector<int> listVals${idx} = parseVector(line);\n    ListNode* param${idx} = buildList(listVals${idx});\n`;
        } else if (pType === 'int') {
            parser = `    int param${idx} = stoi(line);\n`;
        } else if (pType === 'string') {
            parser = `    string param${idx} = line;\n`;
        } else if (pType === 'bool') {
            parser = `    bool param${idx} = (line == "true");\n`;
        }

        code += parser;
    });

    const paramNames = funcSig.params.map((_, i) => `param${i}`).join(', ');
    code += `    
    auto result = solution.${functionName}(${paramNames});
    `;

    // Print Output
    const rType = funcSig.returnType;
    if (rType.includes('TreeNode')) {
        code += `    cout << vectorToString(treeToVector(result)) << endl;\n`;
    } else if (rType.includes('ListNode')) {
        code += `    cout << vectorToString(listToVector(result)) << endl;\n`;
    } else if (rType.includes('vector<vector')) {
        code += `    cout << "[";
    for(int i=0; i<result.size(); i++) {
        if(i>0) cout << ",";
        cout << vectorToString(result[i]);
    }
    cout << "]" << endl;\n`;
    } else if (rType.includes('vector')) {
        code += `    cout << vectorToString(result) << endl;\n`;
    } else if (rType === 'bool') {
        code += `    cout << (result ? "true" : "false") << endl;\n`;
    } else {
        code += `    cout << result << endl;\n`;
    }

    code += `    return 0;\n}`;
    return code;
}

// Helpers Implementation
function getCppVectorHelpers() {
    return `// Helpers
vector<int> parseVector(string s) {
    vector<int> res;
    size_t start = s.find('[');
    size_t end = s.find_last_of(']');
    if (start == string::npos || end == string::npos) return res;
    s = s.substr(start + 1, end - start - 1);
    if (s.empty()) return res;
    stringstream ss(s);
    string item;
    while (getline(ss, item, ',')) {
        // Trim spaces
        size_t first = item.find_first_not_of(" ");
        if (first == string::npos) continue;
        size_t last = item.find_last_not_of(" ");
        item = item.substr(first, last - first + 1);
        
        if (item == "null") res.push_back(-9999); // Sentinel for null
        else res.push_back(stoi(item));
    }
    return res;
}
string vectorToString(const vector<int>& v) {
    string res = "[";
    for (size_t i = 0; i < v.size(); ++i) {
        if (i > 0) res += ",";
        if (v[i] == -9999) res += "null";
        else res += to_string(v[i]);
    }
    res += "]";
    return res;
}
vector<vector<int>> parseMatrix(string s) {
    vector<vector<int>> res;
    size_t start = s.find('[');
    size_t end = s.find_last_of(']');
    if(start == string::npos || end == string::npos) return res;
    s = s.substr(start+1, end-start-1);
    
    int balance = 0;
    string curr;
    for(char c : s) {
        if(c == '[') balance++;
        if(c == ']') balance--;
        
        if(c == ',' && balance == 0) {
            if(!curr.empty()) res.push_back(parseVector(curr));
            curr = "";
        } else {
            curr += c;
        }
    }
    if(!curr.empty()) res.push_back(parseVector(curr));
    return res;
}
`;
}

function getCppTreeHelpers() {
    return `// Tree Helpers
TreeNode* buildTree(vector<int>& vals) {
    if (vals.empty()) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q; q.push(root);
    size_t i = 1;
    while (!q.empty() && i < vals.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < vals.size()) {
            if (vals[i] != -9999) {
                curr->left = new TreeNode(vals[i]);
                q.push(curr->left);
            }
            i++;
        }
        if (i < vals.size()) {
            if (vals[i] != -9999) {
                curr->right = new TreeNode(vals[i]);
                q.push(curr->right);
            }
            i++;
        }
    }
    return root;
}
vector<int> treeToVector(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) {
            res.push_back(curr->val);
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res.push_back(-9999);
        }
    }
    while (!res.empty() && res.back() == -9999) {
        res.pop_back();
    }
    return res;
}
`;
}

function getCppListHelpers() {
    return `// List Helpers
ListNode* buildList(vector<int>& vals) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for(int x : vals) {
        if(x == -9999) continue;
        curr->next = new ListNode(x);
        curr = curr->next;
    }
    return dummy.next;
}
vector<int> listToVector(ListNode* head) {
    vector<int> res;
    while(head) {
        res.push_back(head->val);
        head = head->next;
    }
    return res;
}
`;
}

// To avoid complexity, I will inject the robust parseVector that handles "null" as a sentinel
function getCppVectorHelpers() {
    return `// Helpers
vector<int> parseVector(string s) {
    vector<int> res;
    size_t start = s.find('[');
    size_t end = s.find_last_of(']');
    if(start == string::npos || end == string::npos) return res;
    s = s.substr(start+1, end-start-1);
    stringstream ss(s);
    string item;
    while(getline(ss, item, ',')) {
        // Trim spaces
        item.erase(0, item.find_first_not_of(" "));
        item.erase(item.find_last_not_of(" ") + 1);
        if(item == "null") res.push_back(-9999); // Sentinel
        else res.push_back(stoi(item));
    }
    return res;
}
string vectorToString(const vector<int>& v) {
    string res = "[";
    for(size_t i=0; i<v.size(); i++) {
        if(i>0) res += ",";
        if(v[i] == -9999) res += "null";
        else res += to_string(v[i]);
    }
    res += "]";
    return res;
}
vector<vector<int>> parseMatrix(string s) {
    vector<vector<int>> res;
    size_t start = s.find('[');
    size_t end = s.find_last_of(']');
    if(start == string::npos || end == string::npos) return res;
    s = s.substr(start+1, end-start-1);
    
    int balance = 0;
    string curr;
    for(char c : s) {
        if(c == '[') balance++;
        if(c == ']') balance--;
        
        if(c == ',' && balance == 0) {
            if(!curr.empty()) res.push_back(parseVector(curr));
            curr = "";
        } else {
            curr += c;
        }
    }
    if(!curr.empty()) res.push_back(parseVector(curr));
    return res;
}
`;
}

function getCppTreeHelpers() {
    return `// Tree Helpers
TreeNode* buildTree(vector<int>& vals) {
    if(vals.empty() || vals[0] == -9999) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q; q.push(root);
    size_t i = 1;
    while(!q.empty() && i < vals.size()) {
        TreeNode* curr = q.front(); q.pop();
        if(i < vals.size() && vals[i] != -9999) {
            curr->left = new TreeNode(vals[i]);
            q.push(curr->left);
        }
        i++;
        if(i < vals.size() && vals[i] != -9999) {
            curr->right = new TreeNode(vals[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}
vector<int> treeToVector(TreeNode* root) {
    vector<int> res;
    if(!root) return res;
    queue<TreeNode*> q; q.push(root);
    while(!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if(curr) {
            res.push_back(curr->val);
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res.push_back(-9999);
        }
    }
    // Trim trailing nulls
    while(!res.empty() && res.back() == -9999) res.pop_back();
    return res;
}
`;
}

function getCppListHelpers() {
    return `// List Helpers
ListNode* buildList(vector<int>& vals) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for(int x : vals) {
        if(x == -9999) continue; // Should not happen for lists usually
        curr->next = new ListNode(x);
        curr = curr->next;
    }
    return dummy.next;
}
vector<int> listToVector(ListNode* head) {
    vector<int> res;
    while(head) {
        res.push_back(head->val);
        head = head->next;
    }
    return res;
}
`;
}

// ============================================================================
// JAVA TEMPLATE GENERATOR
// ============================================================================
// ============================================================================
// JAVA TEMPLATE GENERATOR
// ============================================================================
async function generateJavaTemplate(questionId, functionName, funcSig, inputType, outputType) {
    const inputStr = JSON.stringify(inputType);
    const needsTreeNode = inputStr.includes('tree') || outputType.includes('tree') || funcSig.params.some(p => p.type.includes('TreeNode'));
    const needsListNode = inputStr.includes('linked_list') || outputType.includes('linked_list') || funcSig.params.some(p => p.type.includes('ListNode'));

    // 1. Header (Imports)
    const headerCode = `import java.util.*;\n`;

    // 2. Boilerplate (Classes + Helpers)
    let boilerplate = `// Helpers\n`;
    if (needsTreeNode) boilerplate += `/**
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
    if (needsListNode) boilerplate += `/**
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

    const rType = convertTypeToJava(funcSig.returnType);
    const pStr = funcSig.params.map(p => `${convertTypeToJava(p.type)} ${p.name}`).join(', ');

    // 3. User Function
    const userFunction = `class Solution {
    public ${rType} ${functionName}(${pStr}) {
        
    }
}`;

    // 4. Main Function
    const mainFunction = `public class Main {
    public static void main(String[] args) {
        // Driver code not yet implemented for Java
    }
}`;
    // 5. Diagram
    const diagram = null;

    await prisma.questionTemplate.upsert({
        where: { questionId_language: { questionId, language: 'java' } },
        update: { headerCode, boilerplate, userFunction, mainFunction, diagram },
        create: { questionId, language: 'java', headerCode, boilerplate, userFunction, mainFunction, diagram }
    });
}
// Keep convertTypeToJava helper

function convertTypeToJava(t) {
    if (t.includes('vector<vector')) return 'int[][]';
    if (t.includes('vector')) return 'int[]';
    if (t.includes('string')) return 'String';
    if (t.includes('bool')) return 'boolean';
    if (t.includes('TreeNode')) return 'TreeNode';
    if (t.includes('ListNode')) return 'ListNode';
    return t;
}

// ============================================================================
// PYTHON TEMPLATE GENERATOR
// ============================================================================
async function generatePythonTemplate(questionId, functionName, funcSig, inputType, outputType) {
    const inputStr = JSON.stringify(inputType);
    const needsTreeNode = inputStr.includes('tree') || outputType.includes('tree') || funcSig.params.some(p => p.type.includes('TreeNode'));
    const needsListNode = inputStr.includes('linked_list') || outputType.includes('linked_list') || funcSig.params.some(p => p.type.includes('ListNode'));

    // 1. Header (Imports)
    const headerCode = `from typing import List, Optional\nimport collections\nimport math\n`;

    // 2. Boilerplate (Classes)
    let boilerplate = ``;
    if (needsTreeNode) boilerplate += `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
`;
    if (needsListNode) boilerplate += `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
`;

    // 3. User Function
    const pStr = funcSig.params.map(p => p.name).join(', ');
    const userFunction = `class Solution:
    def ${functionName}(self, ${pStr}):
        pass`;

    // 4. Main Function
    const mainFunction = `if __name__ == "__main__":
    # Driver code not yet implemented for Python
    pass`;

    // 5. Diagram
    const diagram = null;

    await prisma.questionTemplate.upsert({
        where: { questionId_language: { questionId, language: 'python' } },
        update: { headerCode, boilerplate, userFunction, mainFunction, diagram },
        create: { questionId, language: 'python', headerCode, boilerplate, userFunction, mainFunction, diagram }
    });
}

// ============================================================================
// JS TEMPLATE GENERATOR
// ============================================================================
async function generateJavaScriptTemplate(questionId, functionName, funcSig, inputType, outputType) {
    const inputStr = JSON.stringify(inputType);
    const needsTreeNode = inputStr.includes('tree') || outputType.includes('tree') || funcSig.params.some(p => p.type.includes('TreeNode'));
    const needsListNode = inputStr.includes('linked_list') || outputType.includes('linked_list') || funcSig.params.some(p => p.type.includes('ListNode'));

    // 1. Header (Imports/Setup)
    const headerCode = `// JavaScript Environment\n`;

    // 2. Boilerplate (Constructors)
    let boilerplate = ``;
    if (needsTreeNode) boilerplate += `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
`;
    if (needsListNode) boilerplate += `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
`;

    // 3. User Function
    const pStr = funcSig.params.map(p => p.name).join(', ');
    const userFunction = `/**
 * @param {${funcSig.params.map(p => p.type).join('} param\n * @param {')}}
 * @return {${funcSig.returnType}}
 */
var ${functionName} = function(${pStr}) {
    
};`;

    // 4. Main Function
    const mainFunction = `// Driver code not yet implemented for JS`;

    // 5. Diagram
    const diagram = null;

    await prisma.questionTemplate.upsert({
        where: { questionId_language: { questionId, language: 'javascript' } },
        update: { headerCode, boilerplate, userFunction, mainFunction, diagram },
        create: { questionId, language: 'javascript', headerCode, boilerplate, userFunction, mainFunction, diagram }
    });
}

seedProperTemplates();
