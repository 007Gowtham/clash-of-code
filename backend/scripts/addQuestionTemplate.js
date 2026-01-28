/**
 * Helper script to add templates for a question
 * 
 * Usage:
 * node scripts/addQuestionTemplate.js <questionId> <language>
 * 
 * This will prompt you to enter each template component interactively.
 */

const { prisma } = require('../src/config/database');
const codeTemplateService = require('../src/services/codeTemplateService');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function multiLineInput(prompt) {
    console.log(prompt);
    console.log('(Enter a line with just "END" to finish)');

    const lines = [];
    while (true) {
        const line = await question('');
        if (line.trim() === 'END') break;
        lines.push(line);
    }

    return lines.join('\n');
}

async function main() {
    try {
        const args = process.argv.slice(2);

        if (args.length < 2) {
            console.log('Usage: node scripts/addQuestionTemplate.js <questionId> <language>');
            console.log('Languages: cpp, python, javascript, java');
            process.exit(1);
        }

        const [questionId, language] = args;

        // Validate language
        const validLanguages = ['cpp', 'python', 'javascript', 'java'];
        if (!validLanguages.includes(language)) {
            console.error(`Invalid language: ${language}`);
            console.error(`Valid languages: ${validLanguages.join(', ')}`);
            process.exit(1);
        }

        // Check if question exists
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question) {
            console.error(`Question not found: ${questionId}`);
            process.exit(1);
        }

        console.log(`\n📝 Adding ${language} template for: ${question.title}\n`);

        // Collect template components
        console.log('='.repeat(60));
        const headerCode = await multiLineInput('\n1️⃣  Enter HEADER CODE (imports, includes, helpers):');

        console.log('\n' + '='.repeat(60));
        const definition = await multiLineInput('\n2️⃣  Enter DEFINITIONS (ListNode, TreeNode, etc.):');

        console.log('\n' + '='.repeat(60));
        const userFunction = await multiLineInput('\n3️⃣  Enter USER FUNCTION (signature shown in editor):');

        console.log('\n' + '='.repeat(60));
        const mainFunction = await multiLineInput('\n4️⃣  Enter MAIN FUNCTION (wrapper that reads input, calls user function, prints output):');

        console.log('\n' + '='.repeat(60));
        const boilerplate = await multiLineInput('\n5️⃣  Enter BOILERPLATE (optional, press END if none):');

        // Save template
        console.log('\n💾 Saving template...');

        const template = await codeTemplateService.saveTemplate(questionId, language, {
            headerCode: headerCode || null,
            definition: definition || null,
            userFunction: userFunction || null,
            mainFunction: mainFunction || null,
            boilerplate: boilerplate || null
        });

        console.log('\n✅ Template saved successfully!');
        console.log(`   Question: ${question.title}`);
        console.log(`   Language: ${language}`);
        console.log(`   Template ID: ${template.id}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
