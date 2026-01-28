/**
 * Check Full Flow: Template Generation -> Execution (Judge0)
 * 
 * This script simulates the backend flow:
 * 1. Mocks DB retrieval of template
 * 2. Generates executable code (User Code + Wrapper)
 * 3. Sends to CodeExecutionService (which calls Judge0)
 * 
 * Usage: node scripts/checkFullFlow.js
 */

// 1. Setup Mock Database
const { prisma } = require('../src/config/database');

// Mock Template for C++ Addition
const mockTemplate = {
    language: 'cpp',
    headerCode: '#include <iostream>\nusing namespace std;',
    definition: '',
    userFunction: 'int add(int a, int b) { return a + b; }',
    mainFunction: `
int main() {
    int a, b;
    if (!(cin >> a >> b)) return 0;
    cout << add(a, b);
    return 0;
}
    `,
    boilerplate: ''
};

// Monkey-patch Prisma to return our mock template
prisma.questionTemplate.findUnique = async () => mockTemplate;

// 2. Import Services (must be after mocking if they used the prisma instance immediately on load - usually they don't use it until method call)
const codeTemplateService = require('../src/services/codeTemplateService');
const codeExecutionService = require('../src/services/codeExecutionService');

async function runCheck() {
    console.log('🚀 Starting Full Flow Check...\n');

    try {
        // --- STEP 1: Generate Code ---
        console.log('1️⃣  Generating Executable Code...');

        const questionId = 'dummy-id';
        const language = 'cpp';
        // User just writes function body/implementation
        const userFunctionCode = `
int add(int a, int b) { 
    // User logic
    return a + b; 
}`;

        const executableCode = await codeTemplateService.generateExecutableCode(
            questionId,
            language,
            userFunctionCode
        );

        console.log('   ✅ Code Generated!');
        console.log('   -----------------------------------');
        console.log(executableCode);
        console.log('   -----------------------------------\n');

        // --- STEP 2: Execute Code (Judge0) ---
        console.log('2️⃣  Executing on Judge0...');

        // Define a simple test case: Input "5 10", Expect "15"
        const testCases = [
            {
                id: 'test-1',
                input: '5 10',
                output: '15',
                timeLimit: 2, // seconds
                memoryLimit: 128 // KB
            }
        ];

        console.log(`   Running against ${testCases.length} test case(s)...`);

        const result = await codeExecutionService.runTestCases(
            executableCode,
            language,
            testCases
        );

        console.log('\n   📊 Execution Results:');
        console.log('   Verdict:', result.allPassed ? '✅ PASSED' : '❌ FAILED');
        console.log('   Tests Passed:', `${result.testsPassed}/${result.totalTests}`);

        result.results.forEach(r => {
            console.log(`\n   [Test Case] Expected: ${r.expectedOutput} | Actual: ${r.actualOutput}`);
            console.log(`   Status: ${r.status}`);
            if (r.error) console.log(`   Error: ${r.error}`);
        });

        if (result.allPassed) {
            console.log('\n✨ SUCCESS: The full flow works perfectly!');
        } else {
            console.log('\n⚠️  Logic worked, but test case failed (Check Judge0 response)');
        }

    } catch (error) {
        console.error('\n❌ Error during check:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 TIP: Is Judge0 running? (Default: http://127.0.0.1:2358)');
            console.log('   The generation logic is correct, but execution failed due to connection.');
        }
    } finally {
        // Close DB connection (mocked, but good practice if real one initialized)
        await prisma.$disconnect();
    }
}

runCheck();
