/**
 * Display FULL CODE for all questions in all languages
 * Shows: headerCode + userFunction + boilerplate + mainFunction
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function displayFullCode() {
    try {
        console.log('🔍 Fetching all questions with complete templates...\n');

        const questions = await prisma.question.findMany({
            include: {
                templates: {
                    orderBy: { language: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 15 // Show first 15 questions to avoid overwhelming output
        });

        console.log(`📚 Showing ${questions.length} questions\n`);

        for (const question of questions) {
            console.log('\n' + '='.repeat(100));
            console.log(`📝 QUESTION: ${question.title} (${question.slug})`);
            console.log(`   Difficulty: ${question.difficulty} | Points: ${question.points}`);
            console.log('='.repeat(100));

            if (question.templates.length === 0) {
                console.log('   ⚠️  NO TEMPLATES FOUND\n');
                continue;
            }

            for (const template of question.templates) {
                console.log(`\n${'▼'.repeat(50)}`);
                console.log(`🔹 LANGUAGE: ${template.language.toUpperCase()}`);
                console.log('▼'.repeat(50));

                // Header Code
                if (template.headerCode) {
                    console.log('\n📦 HEADER CODE:');
                    console.log('-'.repeat(80));
                    console.log(template.headerCode);
                }

                // Definition (TreeNode, ListNode, etc.)
                if (template.definition) {
                    console.log('\n📐 DEFINITIONS:');
                    console.log('-'.repeat(80));
                    console.log(template.definition);
                }

                // User Function (what user sees in editor)
                console.log('\n✏️  USER FUNCTION (Editable):');
                console.log('-'.repeat(80));
                console.log(template.userFunction || 'MISSING');

                // Main Function (driver code)
                if (template.mainFunction) {
                    console.log('\n🚀 MAIN FUNCTION (Driver Code):');
                    console.log('-'.repeat(80));
                    console.log(template.mainFunction);
                }

                // Boilerplate (combined)
                if (template.boilerplate) {
                    console.log('\n📋 BOILERPLATE (Combined):');
                    console.log('-'.repeat(80));
                    console.log(template.boilerplate);
                }

                console.log('\n' + '▲'.repeat(50));
            }
        }

        console.log('\n\n' + '='.repeat(100));
        console.log('✅ COMPLETE');
        console.log('='.repeat(100));

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

displayFullCode();
