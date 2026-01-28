/**
 * Display all language templates for all questions in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function displayAllTemplates() {
    try {
        console.log('🔍 Fetching all questions with templates...\n');

        const questions = await prisma.question.findMany({
            include: {
                templates: {
                    orderBy: { language: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        console.log(`📚 Found ${questions.length} questions\n`);
        console.log('='.repeat(80));

        for (const question of questions) {
            console.log(`\n📝 Question: ${question.title} (${question.slug})`);
            console.log(`   Difficulty: ${question.difficulty} | Points: ${question.points}`);
            console.log(`   Templates: ${question.templates.length}`);
            console.log('-'.repeat(80));

            if (question.templates.length === 0) {
                console.log('   ⚠️  NO TEMPLATES FOUND');
            } else {
                // Group by language
                const templatesByLang = {};
                question.templates.forEach(t => {
                    templatesByLang[t.language] = t;
                });

                // Display each language
                const languages = ['cpp', 'java', 'python', 'javascript'];
                for (const lang of languages) {
                    const template = templatesByLang[lang];
                    if (template) {
                        console.log(`\n   ✅ ${lang.toUpperCase()}:`);
                        console.log(`      userFunction: ${template.userFunction ? template.userFunction.substring(0, 100) + '...' : 'MISSING'}`);
                        console.log(`      headerCode: ${template.headerCode ? 'Present' : 'Empty'}`);
                        console.log(`      definition: ${template.definition ? 'Present' : 'Empty'}`);
                        console.log(`      mainFunction: ${template.mainFunction ? 'Present' : 'Empty'}`);
                        console.log(`      boilerplate: ${template.boilerplate ? 'Present' : 'Empty'}`);
                    } else {
                        console.log(`\n   ❌ ${lang.toUpperCase()}: MISSING`);
                    }
                }
            }
            console.log('\n' + '='.repeat(80));
        }

        // Summary
        console.log('\n\n📊 SUMMARY:');
        console.log('='.repeat(80));

        const totalTemplates = questions.reduce((sum, q) => sum + q.templates.length, 0);
        const expectedTemplates = questions.length * 4; // 4 languages per question
        const coverage = ((totalTemplates / expectedTemplates) * 100).toFixed(1);

        console.log(`Total Questions: ${questions.length}`);
        console.log(`Total Templates: ${totalTemplates}`);
        console.log(`Expected Templates: ${expectedTemplates} (4 languages × ${questions.length} questions)`);
        console.log(`Coverage: ${coverage}%`);

        // Count by language
        const langCounts = { cpp: 0, java: 0, python: 0, javascript: 0 };
        questions.forEach(q => {
            q.templates.forEach(t => {
                if (langCounts[t.language] !== undefined) {
                    langCounts[t.language]++;
                }
            });
        });

        console.log('\nTemplates by Language:');
        console.log(`  C++:        ${langCounts.cpp}/${questions.length}`);
        console.log(`  Java:       ${langCounts.java}/${questions.length}`);
        console.log(`  Python:     ${langCounts.python}/${questions.length}`);
        console.log(`  JavaScript: ${langCounts.javascript}/${questions.length}`);

        // Questions missing templates
        const missingTemplates = questions.filter(q => q.templates.length < 4);
        if (missingTemplates.length > 0) {
            console.log(`\n⚠️  ${missingTemplates.length} questions missing templates:`);
            missingTemplates.forEach(q => {
                const missing = 4 - q.templates.length;
                console.log(`   - ${q.title}: ${q.templates.length}/4 (missing ${missing})`);
            });
        } else {
            console.log('\n✅ All questions have templates for all 4 languages!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

displayAllTemplates();
