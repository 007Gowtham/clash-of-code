/**
 * Metadata Migration Helper
 * Updates existing questions with required wrapper generation metadata
 */

const { prisma } = require('../src/config/database');

/**
 * Metadata templates for common problems
 * Add more as needed
 */
const METADATA_TEMPLATES = {
    'twoSum': {
        inputType: JSON.stringify(['array<int>', 'int']),
        outputType: JSON.stringify('array<int>'),
        functionSignature: JSON.stringify({
            returnType: 'vector<int>',
            params: [
                { type: 'vector<int>&', name: 'nums' },
                { type: 'int', name: 'target' }
            ]
        })
    },
    'longestPalindrome': {
        inputType: JSON.stringify(['string']),
        outputType: JSON.stringify('string'),
        functionSignature: JSON.stringify({
            returnType: 'string',
            params: [
                { type: 'string', name: 's' }
            ]
        })
    },
    'reverseList': {
        inputType: JSON.stringify(['linked_list']),
        outputType: JSON.stringify('linked_list'),
        functionSignature: JSON.stringify({
            returnType: 'ListNode*',
            params: [
                { type: 'ListNode*', name: 'head' }
            ]
        })
    },
    'levelOrder': {
        inputType: JSON.stringify(['tree']),
        outputType: JSON.stringify('matrix<int>'),
        functionSignature: JSON.stringify({
            returnType: 'vector<vector<int>>',
            params: [
                { type: 'TreeNode*', name: 'root' }
            ]
        })
    },
    'mergeKLists': {
        inputType: JSON.stringify(['array<linked_list>']),
        outputType: JSON.stringify('linked_list'),
        functionSignature: JSON.stringify({
            returnType: 'ListNode*',
            params: [
                { type: 'vector<ListNode*>&', name: 'lists' }
            ]
        })
    }
};

async function migrateMetadata() {
    console.log('🔄 Migrating question metadata for wrapper generation...\n');

    try {
        // Get all questions
        const questions = await prisma.question.findMany({
            select: {
                id: true,
                title: true,
                functionName: true,
                functionSignature: true
            }
        });

        console.log(`Found ${questions.length} questions\n`);

        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (const question of questions) {
            // Skip if already has metadata
            if (question.functionSignature) {
                console.log(`⏭️  Skipping ${question.title} (already has metadata)`);
                skipped++;
                continue;
            }

            // Check if we have a template for this function
            const template = METADATA_TEMPLATES[question.functionName];

            if (!template) {
                console.log(`⚠️  No template for ${question.title} (${question.functionName})`);
                failed++;
                continue;
            }

            // Update question with metadata
            try {
                await prisma.question.update({
                    where: { id: question.id },
                    data: {
                        inputType: template.inputType,
                        outputType: template.outputType,
                        functionSignature: template.functionSignature
                    }
                });
                console.log(`✅ Updated ${question.title}`);
                updated++;
            } catch (error) {
                console.log(`❌ Failed to update ${question.title}: ${error.message}`);
                failed++;
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('═'.repeat(60));
        console.log(`Total Questions:     ${questions.length}`);
        console.log(`Updated:             ${updated}`);
        console.log(`Skipped (has data):  ${skipped}`);
        console.log(`Failed (no template): ${failed}`);
        console.log('═'.repeat(60));

        if (failed > 0) {
            console.log('\n⚠️  To add metadata for remaining questions, update METADATA_TEMPLATES in this file.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    migrateMetadata();
}

module.exports = { migrateMetadata, METADATA_TEMPLATES };
