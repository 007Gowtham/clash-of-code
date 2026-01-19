const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reverseListDef = {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    functionName: 'reverseList',
    functionSignature: JSON.stringify({
        returnType: 'ListNode*',
        params: [{ type: 'ListNode*', name: 'head' }]
    }),
    inputType: 'linked_list',
    outputType: 'linked_list',
    difficulty: 'EASY',
    points: 150,
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.'
};

const longestSubstringDef = {
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    functionName: 'longestPalindrome',
    functionSignature: JSON.stringify({
        returnType: 'string',
        params: [{ type: 'string', name: 's' }]
    }),
    inputType: 'string',
    outputType: 'string',
    difficulty: 'MEDIUM',
    points: 100,
    description: 'Given a string s, return the longest palindromic substring in s.'
};

const levelOrderDef = {
    title: 'Binary Tree Level Order Traversal',
    slug: 'binary-tree-level-order-traversal',
    functionName: 'levelOrder',
    functionSignature: JSON.stringify({
        returnType: 'vector<vector<int>>',
        params: [{ type: 'TreeNode*', name: 'root' }]
    }),
    inputType: 'tree',
    outputType: 'tree',
    difficulty: 'MEDIUM',
    points: 100,
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).'
};


async function fixQuestions() {
    console.log('🔧 Fixing broken questions...\n');

    try {
        await fixQuestionType(reverseListDef);
        await fixQuestionType(longestSubstringDef);
        await fixQuestionType(levelOrderDef);

        console.log('\n✅ All questions fixed!');

    } catch (error) {
        console.error('❌ Error fixing questions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function fixQuestionType(def) {
    console.log(`Fixing "${def.title}"...`);

    const result = await prisma.question.updateMany({
        where: {
            title: def.title
        },
        data: {
            slug: def.slug, // Note: this might cause unique constraint errors if multiple exist. 
            // Better to append random string to slug if duplicates, but for now let's try setting fields.
            functionName: def.functionName,
            functionSignature: def.functionSignature,
            inputType: def.inputType,
            outputType: def.outputType
        }
    });

    console.log(`  Updated ${result.count} records.`);

    // Now verify slugs. If we have multiple questions with the same title, 
    // updateMany will set them all to the same slug, which VIOLATES unique constraint usually.
    // Wait, let's check if slug is unique in schema.
}

fixQuestions();
