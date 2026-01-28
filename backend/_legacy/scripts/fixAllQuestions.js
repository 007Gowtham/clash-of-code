/**
 * Fix all questions in database
 * - Add missing metadata (functionSignature, inputType, outputType)
 * - Generate templates for all languages
 * - Fix test case formats
 */

const { prisma } = require('../src/config/database');
const templateGenerationService = require('../src/services/wrapperGeneration/TemplateGenerationService');

// Question metadata definitions
const questionMetadata = {
    'two-sum': {
        functionName: 'twoSum',
        inputType: JSON.stringify(['array<int>', 'int']),
        outputType: JSON.stringify('array<int>'),
        functionSignature: JSON.stringify({
            params: [
                { name: 'nums', type: 'vector<int>&' },
                { name: 'target', type: 'int' }
            ],
            returnType: 'vector<int>'
        })
    },
    'merge-two-sorted-lists': {
        functionName: 'mergeTwoLists',
        inputType: JSON.stringify(['linked_list', 'linked_list']),
        outputType: JSON.stringify('linked_list'),
        functionSignature: JSON.stringify({
            params: [
                { name: 'list1', type: 'ListNode*' },
                { name: 'list2', type: 'ListNode*' }
            ],
            returnType: 'ListNode*'
        })
    },
    'reverse-linked-list': {
        functionName: 'reverseList',
        inputType: JSON.stringify(['linked_list']),
        outputType: JSON.stringify('linked_list'),
        functionSignature: JSON.stringify({
            params: [
                { name: 'head', type: 'ListNode*' }
            ],
            returnType: 'ListNode*'
        })
    },
    'valid-palindrome': {
        functionName: 'isPalindrome',
        inputType: JSON.stringify(['string']),
        outputType: JSON.stringify('boolean'),
        functionSignature: JSON.stringify({
            params: [
                { name: 's', type: 'string' }
            ],
            returnType: 'bool'
        })
    },
    'best-time-to-buy-sell-stock': {
        functionName: 'maxProfit',
        inputType: JSON.stringify(['array<int>']),
        outputType: JSON.stringify('int'),
        functionSignature: JSON.stringify({
            params: [
                { name: 'prices', type: 'vector<int>&' }
            ],
            returnType: 'int'
        })
    },
    'longest-palindromic-substring': {
        functionName: 'longestPalindrome',
        inputType: JSON.stringify(['string']),
        outputType: JSON.stringify('string'),
        functionSignature: JSON.stringify({
            params: [
                { name: 's', type: 'string' }
            ],
            returnType: 'string'
        })
    },
    'binary-tree-level-order-traversal': {
        functionName: 'levelOrder',
        inputType: JSON.stringify(['tree']),
        outputType: JSON.stringify('matrix<int>'),
        functionSignature: JSON.stringify({
            params: [
                { name: 'root', type: 'TreeNode*' }
            ],
            returnType: 'vector<vector<int>>'
        })
    },
    'number-of-islands': {
        functionName: 'numIslands',
        inputType: JSON.stringify(['matrix<char>']),
        outputType: JSON.stringify('int'),
        functionSignature: JSON.stringify({
            params: [
                { name: 'grid', type: 'vector<vector<char>>&' }
            ],
            returnType: 'int'
        })
    }
};

async function fixAllQuestions() {
    console.log('🔧 Starting comprehensive database fix...\n');

    try {
        // Get all questions
        const questions = await prisma.question.findMany({
            orderBy: { createdAt: 'asc' }
        });

        console.log(`📊 Found ${questions.length} questions\n`);

        let fixed = 0;
        let skipped = 0;
        let errors = [];

        for (const question of questions) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📝 Processing: ${question.title}`);
            console.log(`   Slug: ${question.slug}`);
            console.log(`   ID: ${question.id}`);

            try {
                // Find metadata for this question
                const metadata = questionMetadata[question.slug];

                if (!metadata) {
                    console.log(`   ⚠️  No metadata defined for slug: ${question.slug}`);
                    skipped++;
                    continue;
                }

                // Update question metadata
                console.log('   📝 Updating metadata...');
                await prisma.question.update({
                    where: { id: question.id },
                    data: {
                        functionName: metadata.functionName,
                        inputType: metadata.inputType,
                        outputType: metadata.outputType,
                        functionSignature: metadata.functionSignature
                    }
                });
                console.log('   ✅ Metadata updated');

                // Generate templates for all languages
                console.log('   🔨 Generating templates...');
                await templateGenerationService.generateTemplatesForQuestion(question.id);
                console.log('   ✅ Templates generated');

                fixed++;
                console.log(`   ✅ ${question.title} - FIXED`);

            } catch (error) {
                console.error(`   ❌ Error: ${error.message}`);
                errors.push({
                    question: question.title,
                    error: error.message
                });
            }
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log('\n📊 Summary:');
        console.log(`   Total questions: ${questions.length}`);
        console.log(`   ✅ Fixed: ${fixed}`);
        console.log(`   ⚠️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors.length}`);

        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(e => {
                console.log(`   - ${e.question}: ${e.error}`);
            });
        }

        console.log('\n✅ Database fix complete!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixAllQuestions().catch(console.error);
