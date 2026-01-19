const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedQuestionTemplates() {
    console.log('🌱 Seeding Question Templates...\n');

    try {
        const slug = 'binary-tree-inorder-traversal';
        const question = await prisma.question.findUnique({
            where: { slug }
        });

        if (!question) {
            console.error(`❌ Question "${slug}" not found! Run addInorderTraversal.js first.`);
            return;
        }

        console.log(`📍 Found Question: ${question.title} (${question.id})`);

        // ======================================================
        // C++ Template
        // ======================================================
        const cppHeader = `/**
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

        const cppStarter = `class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        
    }
};`;

        const cppDriver = `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
#include <algorithm>
#include <climits>

using namespace std;

// --- Helper Functions for Tree I/O ---

TreeNode* stringToTreeNode(string input) {
    if (input.empty()) return nullptr;
    if (input == "[]") return nullptr;
    
    // Remove brackets
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

        // Trim spaces
        item.erase(0, item.find_first_not_of(" "));

        if (item != "null") {
            int leftNumber = stoi(item);
            node->left = new TreeNode(leftNumber);
            q.push(node->left);
        }

        if (!getline(ss, item, ',')) break;

        // Trim spaces
        item.erase(0, item.find_first_not_of(" "));

        if (item != "null") {
            int rightNumber = stoi(item);
            node->right = new TreeNode(rightNumber);
            q.push(node->right);
        }
    }
    return root;
}

string vectorToString(vector<int> list) {
    if (list.empty()) return "[]";
    
    string result = "[";
    for(int i = 0; i < list.size(); i++) {
        result += to_string(list[i]);
        if (i < list.size() - 1) result += ",";
    }
    result += "]";
    return result;
}

int main() {
    string line;
    getline(cin, line); // Read single line input: [1,null,2,3]
    
    TreeNode* root = stringToTreeNode(line);
    
    Solution sol;
    vector<int> result = sol.inorderTraversal(root);
    
    cout << vectorToString(result) << endl;
    
    return 0;
}
`;

        // Upsert C++ Template
        await prisma.questionTemplate.upsert({
            where: {
                questionId_language: {
                    questionId: question.id,
                    language: 'cpp'
                }
            },
            update: {
                headerCode: cppHeader,
                starterCode: cppStarter,
                driverCode: cppDriver
            },
            create: {
                questionId: question.id,
                language: 'cpp',
                headerCode: cppHeader,
                starterCode: cppStarter,
                driverCode: cppDriver
            }
        });

        console.log('✅ C++ Template seeded successfully!');


    } catch (error) {
        console.error('❌ Error seeding tamplates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedQuestionTemplates();
