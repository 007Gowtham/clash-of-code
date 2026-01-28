/**
 * Validate all questions and their templates
 * Check metadata, templates, and test case formats
 */

const { prisma } = require('../src/config/database');
const templateService = require('../src/services/wrapperGeneration/TemplateGenerationService');

async function validateAllQuestions() {
    console.log('🔍 Starting comprehensive question validation\n');

    const questions = await prisma.question.findMany({
        include: {
            templates: true,
            testCases: {
                where: { isSample: true },
                take: 1
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log(`📊 Found ${questions.length} questions\n`);

    const results = {
        valid: [],
        invalid: [],
        needsTemplates: [],
        summary: {
            total: questions.length,
            validCount: 0,
            invalidCount: 0,
            needsTemplatesCount: 0
        }
    };

    for (const question of questions) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📝 ${question.title} (${question.slug})`);
        console.log(`   ID: ${question.id}`);

        const issues = [];
        const warnings = [];

        // Check metadata
        if (!question.functionName) issues.push('Missing functionName');
        if (!question.inputType) issues.push('Missing inputType');
        if (!question.outputType) issues.push('Missing outputType');
        if (!question.functionSignature) issues.push('Missing functionSignature');

        // Check test cases
        if (question.testCases.length === 0) {
            warnings.push('No sample test cases');
        }

        // Check templates
        const languages = ['cpp', 'python', 'javascript', 'java'];
        const missingTemplates = [];

        for (const lang of languages) {
            const hasTemplate = question.templates.some(t => t.language === lang);
            if (!hasTemplate) {
                missingTemplates.push(lang);
            }
        }

        if (missingTemplates.length > 0) {
            issues.push(`Missing templates: ${missingTemplates.join(', ')}`);
        }

        // Validate input/output types format
        if (question.inputType) {
            try {
                JSON.parse(question.inputType);
            } catch (e) {
                issues.push('Invalid inputType JSON format');
            }
        }

        if (question.outputType) {
            try {
                JSON.parse(question.outputType);
            } catch (e) {
                issues.push('Invalid outputType JSON format');
            }
        }

        // Report results
        if (issues.length === 0 && missingTemplates.length === 0) {
            console.log('   ✅ VALID - All checks passed');
            if (warnings.length > 0) {
                console.log(`   ⚠️  Warnings: ${warnings.join(', ')}`);
            }
            results.valid.push({
                id: question.id,
                title: question.title,
                slug: question.slug,
                languages: languages
            });
            results.summary.validCount++;
        } else if (missingTemplates.length > 0 && issues.length === 1) {
            console.log('   🔨 NEEDS TEMPLATES');
            console.log(`   Missing: ${missingTemplates.join(', ')}`);
            results.needsTemplates.push({
                id: question.id,
                title: question.title,
                slug: question.slug,
                missingTemplates
            });
            results.summary.needsTemplatesCount++;
        } else {
            console.log('   ❌ INVALID');
            issues.forEach(issue => console.log(`      - ${issue}`));
            results.invalid.push({
                id: question.id,
                title: question.title,
                slug: question.slug,
                issues
            });
            results.summary.invalidCount++;
        }
    }

    // Print summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('\n📊 VALIDATION SUMMARY\n');
    console.log(`Total Questions: ${results.summary.total}`);
    console.log(`✅ Valid: ${results.summary.validCount}`);
    console.log(`🔨 Needs Templates: ${results.summary.needsTemplatesCount}`);
    console.log(`❌ Invalid: ${results.summary.invalidCount}`);

    // Export valid questions for Postman
    if (results.valid.length > 0) {
        console.log('\n✅ VALID QUESTIONS (Ready for testing):\n');
        results.valid.forEach((q, idx) => {
            console.log(`${idx + 1}. ${q.title}`);
            console.log(`   ID: ${q.id}`);
            console.log(`   Languages: ${q.languages.join(', ')}`);
        });
    }

    // Save results to file
    const fs = require('fs');
    fs.writeFileSync(
        '/home/aswin/Music/backend/validation-results.json',
        JSON.stringify(results, null, 2)
    );
    console.log('\n💾 Results saved to validation-results.json');

    await prisma.$disconnect();
    return results;
}

validateAllQuestions().catch(console.error);
