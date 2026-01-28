/**
 * Seed Templates Script
 * Generates wrapper templates for all existing questions
 */

const { prisma } = require('../src/config/database');
const TemplateGenerationService = require('../src/services/wrapperGeneration/TemplateGenerationService');

async function seedTemplates() {
    console.log('🚀 Starting template generation for all questions...\n');

    try {
        // Get all questions
        const questions = await prisma.question.findMany({
            select: {
                id: true,
                title: true,
                functionName: true,
                inputType: true,
                outputType: true,
                functionSignature: true
            }
        });

        console.log(`Found ${questions.length} questions in database\n`);

        // Filter questions that have required metadata
        const validQuestions = questions.filter(q =>
            q.functionName && q.inputType && q.outputType && q.functionSignature
        );

        const invalidQuestions = questions.filter(q =>
            !q.functionName || !q.inputType || !q.outputType || !q.functionSignature
        );

        if (invalidQuestions.length > 0) {
            console.log(`⚠️  Warning: ${invalidQuestions.length} questions missing required metadata:`);
            invalidQuestions.forEach(q => {
                console.log(`   - ${q.title} (${q.id})`);
            });
            console.log('');
        }

        console.log(`Generating templates for ${validQuestions.length} valid questions...\n`);

        let succeeded = 0;
        let failed = 0;
        const errors = [];

        for (let i = 0; i < validQuestions.length; i++) {
            const question = validQuestions[i];
            const progress = `[${i + 1}/${validQuestions.length}]`;

            try {
                console.log(`${progress} Generating templates for: ${question.title}`);
                await TemplateGenerationService.generateTemplatesForQuestion(question.id);
                succeeded++;
                console.log(`${progress} ✅ Success\n`);
            } catch (error) {
                failed++;
                errors.push({
                    question: question.title,
                    error: error.message
                });
                console.log(`${progress} ❌ Failed: ${error.message}\n`);
            }
        }

        // Print summary
        console.log('═'.repeat(60));
        console.log('📊 TEMPLATE GENERATION SUMMARY');
        console.log('═'.repeat(60));
        console.log(`Total Questions:     ${questions.length}`);
        console.log(`Valid Questions:     ${validQuestions.length}`);
        console.log(`Invalid Questions:   ${invalidQuestions.length}`);
        console.log(`Successfully Generated: ${succeeded}`);
        console.log(`Failed:              ${failed}`);
        console.log('═'.repeat(60));

        if (errors.length > 0) {
            console.log('\n❌ ERRORS:');
            errors.forEach(({ question, error }) => {
                console.log(`   ${question}: ${error}`);
            });
        }

        if (succeeded > 0) {
            console.log(`\n✅ Successfully generated ${succeeded * 4} templates (${succeeded} questions × 4 languages)`);
        }

        process.exit(failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Fatal error during template generation:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    seedTemplates();
}

module.exports = seedTemplates;
