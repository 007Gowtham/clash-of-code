/**
 * Update existing questions with proper function signatures
 * Run: node scripts/updateFunctionSignatures.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateFunctionSignatures() {
    console.log('🔄 Updating function signatures...\n');

    try {
        // Update Two Sum
        await prisma.question.updateMany({
            where: { slug: 'two-sum' },
            data: {
                functionSignature: JSON.stringify({
                    returnType: 'vector<int>',
                    params: [
                        { type: 'vector<int>&', name: 'nums' },
                        { type: 'int', name: 'target' }
                    ]
                }),
                inputType: JSON.stringify(['array', 'int'])
            }
        });
        console.log('✅ Updated: Two Sum');

        // Update Valid Parentheses
        await prisma.question.updateMany({
            where: { slug: 'valid-parentheses' },
            data: {
                functionSignature: JSON.stringify({
                    returnType: 'bool',
                    params: [{ type: 'string', name: 's' }]
                })
            }
        });
        console.log('✅ Updated: Valid Parentheses');

        // Update Merge Two Sorted Lists
        await prisma.question.updateMany({
            where: { slug: 'merge-two-sorted-lists' },
            data: {
                functionSignature: JSON.stringify({
                    returnType: 'ListNode*',
                    params: [
                        { type: 'ListNode*', name: 'list1' },
                        { type: 'ListNode*', name: 'list2' }
                    ]
                }),
                inputType: JSON.stringify(['linked_list', 'linked_list'])
            }
        });
        console.log('✅ Updated: Merge Two Sorted Lists');

        // Update Binary Tree Level Order
        await prisma.question.updateMany({
            where: { slug: 'binary-tree-level-order-traversal' },
            data: {
                functionSignature: JSON.stringify({
                    returnType: 'vector<vector<int>>',
                    params: [{ type: 'TreeNode*', name: 'root' }]
                })
            }
        });
        console.log('✅ Updated: Binary Tree Level Order Traversal');

        // Update Longest Substring
        await prisma.question.updateMany({
            where: { slug: 'longest-substring-without-repeating-characters' },
            data: {
                functionSignature: JSON.stringify({
                    returnType: 'int',
                    params: [{ type: 'string', name: 's' }]
                })
            }
        });
        console.log('✅ Updated: Longest Substring Without Repeating Characters');

        console.log('\n✅ All function signatures updated successfully!');

    } catch (error) {
        console.error('❌ Error updating function signatures:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateFunctionSignatures()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
