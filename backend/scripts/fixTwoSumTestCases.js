/**
 * Fix Two Sum test case formats
 * Convert from LeetCode format to plain format
 */

const { prisma } = require('../src/config/database');

async function fixTwoSumTestCases() {
    console.log('🔧 Fixing Two Sum test case formats\n');

    // Get all Two Sum questions
    const questions = await prisma.question.findMany({
        where: {
            title: { contains: 'Two Sum' }
        },
        include: {
            testCases: {
                orderBy: { order: 'asc' }
            }
        }
    });

    console.log(`Found ${questions.length} Two Sum questions\n`);

    for (const question of questions) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Question: ${question.title} (${question.slug})`);
        console.log(`ID: ${question.id}`);
        console.log(`Test cases: ${question.testCases.length}\n`);

        for (const tc of question.testCases) {
            const oldInput = tc.input;

            // Check if it's in LeetCode format
            if (oldInput.includes('nums =') || oldInput.includes('target =')) {
                console.log(`  Test ${tc.order}:`);
                console.log(`    Old: ${oldInput}`);

                // Parse LeetCode format: "nums = [2,7,11,15], target = 9"
                const numsMatch = oldInput.match(/nums\s*=\s*\[([^\]]*)\]/);
                const targetMatch = oldInput.match(/target\s*=\s*(\d+)/);

                if (numsMatch && targetMatch) {
                    const nums = numsMatch[1].trim();
                    const target = targetMatch[1].trim();

                    // Convert to plain format:
                    // Line 1: array length
                    // Line 2: array values
                    // Line 3: target
                    const values = nums.split(',').map(v => v.trim());
                    const newInput = `${values.length}\n${values.join(' ')}\n${target}`;

                    console.log(`    New: ${newInput.replace(/\n/g, '\\n')}`);

                    // Update the test case
                    await prisma.testCase.update({
                        where: { id: tc.id },
                        data: { input: newInput }
                    });

                    console.log(`    ✅ Updated`);
                } else {
                    console.log(`    ⚠️  Could not parse format`);
                }
            } else if (oldInput.includes('[') && oldInput.includes(']')) {
                // Array notation format: "[2,7,11,15]\n9"
                console.log(`  Test ${tc.order}:`);
                console.log(`    Old: ${oldInput}`);

                const lines = oldInput.trim().split('\n');
                const arrayLine = lines[0].trim();
                const targetLine = lines[1]?.trim();

                if (arrayLine && targetLine) {
                    // Remove brackets and parse
                    const cleaned = arrayLine.replace(/[\[\]]/g, '');
                    const values = cleaned.split(',').map(v => v.trim());

                    const newInput = `${values.length}\n${values.join(' ')}\n${targetLine}`;

                    console.log(`    New: ${newInput.replace(/\n/g, '\\n')}`);

                    // Update the test case
                    await prisma.testCase.update({
                        where: { id: tc.id },
                        data: { input: newInput }
                    });

                    console.log(`    ✅ Updated`);
                }
            } else {
                console.log(`  Test ${tc.order}: Already in correct format ✓`);
            }
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n✅ All Two Sum test cases fixed!');

    await prisma.$disconnect();
}

fixTwoSumTestCases().catch(console.error);
