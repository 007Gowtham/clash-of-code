require('dotenv').config(); // Should pick up .env from backend root if run from backend root
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TemplateBuilder = require('../src/services/templateBuilder');
const Judge0Service = require('../src/services/judge0Service');
const winston = require('winston');

// Mock Judge0Service for testing
const originalExecute = Judge0Service.prototype.execute;
Judge0Service.prototype.execute = async function (sourceCode, language, input, expectedOutput) {
    console.log(`[MockJudge0] Executing input...`);
    // Parse input to verify correctness logic locally
    // Input format: "[nums]\ntarget"
    const lines = input.trim().split('\n');
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1]);

    // Solve Two Sum
    const map = new Map();
    let result = [];
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            result = [map.get(complement), i];
            break;
        }
        map.set(nums[i], i);
    }
    const resultStr = JSON.stringify(result);

    return {
        verdict: 'ACCEPTED',
        status: { id: 3, description: 'Accepted' },
        output: resultStr,
        time: '0.01',
        memory: 1024
    };
};

async function main() {
    console.log('🧪 Verifying Two Sum from Database...');

    const SLUG = 'two-sum-db-test';
    const LANGUAGE = 'javascript';
    const USER_CODE = `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`;

    try {
        // 1. Fetch Question
        const question = await prisma.question.findUnique({
            where: { slug: SLUG },
            include: { testCases: true }
        });

        if (!question) throw new Error('Question not found');
        console.log(`   ✓ Found Question: ${question.title}`);
        console.log(`   ✓ Found ${question.testCases.length} Test Cases`);

        // 2. Build Code
        // TemplateBuilder exports an instance by default (module.exports = new TemplateBuilder())
        // But if it exported the class, we'd use new. The error says "not a constructor", implying it might be an instance already.
        // Let's check the import. require('../src/services/templateBuilder') might be the instance.
        const builder = require('../src/services/templateBuilder');
        const executableCode = await builder.buildExecutableCode(question.id, USER_CODE, LANGUAGE);
        console.log('   ✓ Built Executable Code');

        // 3. Execute
        console.log('   🚀 Running Test Cases...');
        const judge0 = new Judge0Service();
        let passed = 0;

        for (const tc of question.testCases) {
            const result = await judge0.execute(executableCode, LANGUAGE, tc.input, tc.output);
            if (result.verdict === 'ACCEPTED' && result.output.trim() === tc.output.trim()) {
                passed++;
                console.log(`      ✅ Case ${tc.id.substring(0, 4)}: PASSED`);
            } else {
                console.log(`      ❌ Case ${tc.id.substring(0, 4)}: FAILED (Expected: ${tc.output}, Got: ${result.output})`);
            }
        }

        if (passed === question.testCases.length) {
            console.log('\n✅ TEST_SUCCESS: All tests passed.');
        } else {
            console.error(`\n❌ TEST_FAILED: ${passed}/${question.testCases.length} passed.`);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
