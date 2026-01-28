/**
 * Fix test case format for Merge Two Sorted Lists
 * Convert array notation to linked list format
 */

const { prisma } = require('../src/config/database');

async function fixMergeTwoListsTestCases() {
    const questionId = '19a0fabd-ec7c-4f24-aa4d-ca749c0773a5';

    console.log('🔧 Fixing test cases for Merge Two Sorted Lists\n');

    // Get all test cases
    const testCases = await prisma.testCase.findMany({
        where: { questionId },
        orderBy: { order: 'asc' }
    });

    console.log(`Found ${testCases.length} test cases\n`);

    for (const tc of testCases) {
        console.log(`Test Case ${tc.order}:`);
        console.log('  Old Input:', tc.input);

        // Parse the array notation input
        const lines = tc.input.trim().split('\n');

        // Convert each line from [1,2,4] to linked list format
        const newInputLines = [];

        for (const line of lines) {
            // Remove brackets and parse
            const cleaned = line.trim().replace(/[\[\]]/g, '');

            if (cleaned === '') {
                // Empty list
                newInputLines.push('0'); // Length = 0
            } else {
                const values = cleaned.split(',').map(v => v.trim());
                newInputLines.push(values.length.toString()); // Length
                newInputLines.push(values.join(' ')); // Values
            }
        }

        const newInput = newInputLines.join('\n');
        console.log('  New Input:', newInput);

        // Update the test case
        await prisma.testCase.update({
            where: { id: tc.id },
            data: { input: newInput }
        });

        console.log('  ✅ Updated\n');
    }

    console.log('✅ All test cases fixed!');

    await prisma.$disconnect();
}

fixMergeTwoListsTestCases().catch(console.error);
