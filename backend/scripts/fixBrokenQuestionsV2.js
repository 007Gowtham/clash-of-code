const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const definitions = [
    {
        title: 'Reverse Linked List',
        baseSlug: 'reverse-linked-list',
        functionName: 'reverseList',
        functionSignature: JSON.stringify({
            returnType: 'ListNode*',
            params: [{ type: 'ListNode*', name: 'head' }]
        }),
        inputType: 'linked_list',
        outputType: 'linked_list'
    },
    {
        title: 'Longest Palindromic Substring',
        baseSlug: 'longest-palindromic-substring',
        functionName: 'longestPalindrome',
        functionSignature: JSON.stringify({
            returnType: 'string',
            params: [{ type: 'string', name: 's' }]
        }),
        inputType: 'string',
        outputType: 'string'
    },
    {
        title: 'Binary Tree Level Order Traversal',
        baseSlug: 'binary-tree-level-order-traversal',
        functionName: 'levelOrder',
        functionSignature: JSON.stringify({
            returnType: 'vector<vector<int>>',
            params: [{ type: 'TreeNode*', name: 'root' }]
        }),
        inputType: 'tree',
        outputType: 'tree'
    }
];

async function fixQuestions() {
    console.log('🔧 Fixing broken questions individually...\n');

    try {
        for (const def of definitions) {
            console.log(`Processing "${def.title}"...`);

            const questions = await prisma.question.findMany({
                where: { title: def.title }
            });

            console.log(`  Found ${questions.length} instances.`);

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const newSlug = i === 0 ? def.baseSlug : `${def.baseSlug}-${i}`;

                await prisma.question.update({
                    where: { id: q.id },
                    data: {
                        slug: newSlug,
                        functionName: def.functionName,
                        functionSignature: def.functionSignature,
                        inputType: def.inputType,
                        outputType: def.outputType
                    }
                });
                console.log(`  Updated ${q.id} -> ${newSlug}`);
            }
        }

        console.log('\n✅ All questions fixed!');

    } catch (error) {
        console.error('❌ Error fixing questions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixQuestions();
