/**
 * Test Wrapper Generation
 * Tests the wrapper generation system with a sample problem
 */

const { prisma } = require('../src/config/database');
const TemplateGenerationService = require('../src/services/wrapperGeneration/TemplateGenerationService');

async function testWrapperGeneration() {
    console.log('🧪 Testing Wrapper Generation System\n');

    try {
        // Create a test question with Two Sum problem
        const testQuestion = await prisma.question.create({
            data: {
                roomId: 'test-room-id', // You'll need a valid room ID
                title: 'Two Sum (Test)',
                slug: 'two-sum-test',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                sampleInput: '4\n2 7 11 15\n9',
                sampleOutput: '[0,1]',
                difficulty: 'EASY',
                points: 100,
                functionName: 'twoSum',
                inputType: JSON.stringify(['array<int>', 'int']),
                outputType: JSON.stringify('array<int>'),
                functionSignature: JSON.stringify({
                    returnType: 'vector<int>',
                    params: [
                        { type: 'vector<int>&', name: 'nums' },
                        { type: 'int', name: 'target' }
                    ]
                })
            }
        });

        console.log(`✅ Created test question: ${testQuestion.title} (${testQuestion.id})\n`);

        // Generate templates
        console.log('Generating templates for all 4 languages...\n');
        const templates = await TemplateGenerationService.generateTemplatesForQuestion(testQuestion.id);

        console.log(`✅ Generated ${templates.length} templates\n`);

        // Display each template
        for (const template of templates) {
            console.log('═'.repeat(80));
            console.log(`Language: ${template.language.toUpperCase()}`);
            console.log('═'.repeat(80));
            console.log('\n--- HEADER CODE ---');
            console.log(template.headerCode);
            console.log('\n--- DEFINITION ---');
            console.log(template.definition || '(none)');
            console.log('\n--- USER FUNCTION ---');
            console.log(template.userFunction);
            console.log('\n--- MAIN FUNCTION (first 500 chars) ---');
            console.log(template.mainFunction.substring(0, 500) + '...');
            console.log('\n');
        }

        // Cleanup
        console.log('Cleaning up test data...');
        await prisma.questionTemplate.deleteMany({
            where: { questionId: testQuestion.id }
        });
        await prisma.question.delete({
            where: { id: testQuestion.id }
        });

        console.log('✅ Test completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    testWrapperGeneration();
}

module.exports = testWrapperGeneration;
