/**
 * Generate Templates for 15 Questions in All 4 Languages
 * Run with: node scripts/generateTemplatesFor15.js
 */

const { PrismaClient } = require('@prisma/client');
const WrapperGenerator = require('../src/services/wrapperGeneration/WrapperGenerator');
const CppWrapperGenerator = require('../src/services/wrapperGeneration/generators/CppWrapperGenerator');
const JavaWrapperGenerator = require('../src/services/wrapperGeneration/generators/JavaWrapperGenerator');
const PythonWrapperGenerator = require('../src/services/wrapperGeneration/generators/PythonWrapperGenerator');
const JavaScriptWrapperGenerator = require('../src/services/wrapperGeneration/generators/JavaScriptWrapperGenerator');

const prisma = new PrismaClient();

const generators = {
    cpp: new CppWrapperGenerator(),
    java: new JavaWrapperGenerator(),
    python: new PythonWrapperGenerator(),
    javascript: new JavaScriptWrapperGenerator()
};

async function generateTemplatesFor15() {
    try {
        console.log('🚀 Generating Templates for All Questions in All 4 Languages...\\n');

        // Get all questions
        const questions = await prisma.question.findMany({
            orderBy: { createdAt: 'asc' }
        });

        console.log(`📚 Found ${questions.length} questions\\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            console.log(`\\n[${i + 1}/${questions.length}] 📝 Processing: ${question.title} (${question.slug})`);

            // Generate templates for each language
            for (const [language, generator] of Object.entries(generators)) {
                try {
                    console.log(`   🔧 Generating ${language.toUpperCase()} template...`);

                    // Generate the template
                    const template = await generator.generate(question);

                    // Upsert to database
                    await prisma.questionTemplate.upsert({
                        where: {
                            questionId_language: {
                                questionId: question.id,
                                language: language
                            }
                        },
                        update: {
                            headerCode: template.headerCode || '',
                            userFunction: template.userFunction,
                            definition: template.definition || '',
                            mainFunction: template.mainFunction,
                            boilerplate: template.boilerplate || '',
                            diagram: template.diagram || ''
                        },
                        create: {
                            questionId: question.id,
                            language: language,
                            headerCode: template.headerCode || '',
                            userFunction: template.userFunction,
                            definition: template.definition || '',
                            mainFunction: template.mainFunction,
                            boilerplate: template.boilerplate || '',
                            diagram: template.diagram || ''
                        }
                    });

                    console.log(`      ✅ ${language.toUpperCase()} template saved`);
                    successCount++;

                } catch (error) {
                    console.error(`      ❌ Error generating ${language.toUpperCase()} template:`, error.message);
                    errorCount++;
                }
            }

            console.log(`   ✅ Completed all languages for: ${question.title}`);
        }

        console.log('\\n\\n' + '='.repeat(60));
        console.log('📊 GENERATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successful templates: ${successCount}`);
        console.log(`❌ Failed templates: ${errorCount}`);
        console.log(`📚 Total questions processed: ${questions.length}`);
        console.log(`🌍 Languages supported: 4 (C++, Java, Python, JavaScript)`);
        console.log(`📝 Expected total templates: ${questions.length * 4}`);
        console.log('='.repeat(60));

        if (errorCount === 0) {
            console.log('\\n🎉 All templates generated successfully!');
            console.log('\\n🚀 Next Steps:');
            console.log('   1. Test the code editor with different questions');
            console.log('   2. Verify all 4 languages load correctly');
            console.log('   3. Test code execution for each question type');
        } else {
            console.log('\\n⚠️  Some templates failed to generate. Please review the errors above.');
        }

        console.log('\\n');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

generateTemplatesFor15();
