const templateBuilder = require('../src/services/templateBuilder');
const { prisma } = require('../src/config/database');

// Standalone Test Script
async function runTest() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   TEMPLATE BUILDER SERVICE TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    let passed = 0;
    let failed = 0;

    // --- MOCK PRISMA ---
    console.log('🔧 Setting up Mock Prisma...');

    // Original methods to restore if needed (though process exits anyway)
    const originalFindUnique = prisma.questionTemplate.findUnique;

    // Mock Data
    const mockTemplates = {
        'q1_javascript': {
            questionId: 'q1',
            language: 'javascript',
            headerCode: '// Header',
            definition: '// Definition',
            mainFunction: '// Main Function\nrunTest();',
            boilerplate: '// Boilerplate',
            userFunction: 'function user() {}'
        },
        'q2_python': {
            questionId: 'q2',
            language: 'python',
            headerCode: '# Header',
            definition: '# Definition',
            mainFunction: 'if __name__ == "__main__":\n    {{USER_FUNCTION}}\n    run_test()',
            boilerplate: '# Boilerplate',
            userFunction: 'def user(): pass'
        }
    };

    prisma.questionTemplate.findUnique = async (args) => {
        const { questionId, language } = args.where.questionId_language;
        const key = `${questionId}_${language}`;
        console.log(`[MOCK DB] findUnique ${key}`);
        return mockTemplates[key] || null;
    };


    // --- TEST TESTS ---

    async function test(name, fn) {
        try {
            process.stdout.write(`Testing: ${name.padEnd(50)} `);
            await fn();
            console.log('✅ PASSED');
            passed++;
        } catch (error) {
            console.log('❌ FAILED');
            console.error('   Error:', error.message);
            failed++;
        }
    }

    console.log('\n🚀 Starting Tests...\n');

    await test('Build Executable Code (Concatenation)', async () => {
        const code = await templateBuilder.buildExecutableCode('q1', 'function solution() {}', 'javascript');
        const expected = [
            '// Header',
            '// Definition',
            'function solution() {}',
            '// Main Function\nrunTest();'
        ].join('\n\n');

        if (code !== expected) {
            throw new Error(`\nExpected:\n${JSON.stringify(expected)}\nGot:\n${JSON.stringify(code)}`);
        }
    });

    await test('Build Executable Code (Injection)', async () => {
        const code = await templateBuilder.buildExecutableCode('q2', 'def solution(): pass', 'python');
        // Note: Logic logic might differ slightly, let's verify exact output
        // Logic: injectUserCode only returns injected part.
        // Then buildExecutableCode prepends header/definition.

        // Expected parts:
        // # Header
        // # Definition
        // if __name__ == "__main__":\n    def solution(): pass\n    run_test()

        if (!code.includes('def solution(): pass')) throw new Error('User code not injected');
        if (!code.includes('# Header')) throw new Error('Header missing');
        if (code.includes('{{USER_FUNCTION}}')) throw new Error('Placeholder not generated');
    });

    await test('Get Boilerplate', async () => {
        const bp = await templateBuilder.getBoilerplate('q1', 'javascript');
        if (bp !== '// Boilerplate') throw new Error('Wrong boilerplate returned');
    });

    await test('Security Validation (Malicious Code)', async () => {
        try {
            await templateBuilder.buildExecutableCode('q1', 'require("child_process").exec("rm -rf")', 'javascript');
            throw new Error('Should have failed validation');
        } catch (e) {
            if (!e.message.includes('Security validation failed')) {
                throw e; // Wrong error
            }
        }
    });

    await test('Missing Template Handling', async () => {
        try {
            await templateBuilder.buildExecutableCode('missing_id', 'code', 'javascript');
            throw new Error('Should have thrown template not found');
        } catch (e) {
            if (!e.message.includes('Template not found')) {
                throw e;
            }
        }
    });

    // --- SUMMARY ---
    console.log('\n' + '═'.repeat(60));
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) process.exit(1);
}

runTest();
