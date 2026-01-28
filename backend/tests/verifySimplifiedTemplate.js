/**
 * Test for CodeTemplateService (Simplified System)
 * 
 * Verifies that the service correctly concatenates wrapper parts.
 * Uses a mock for Prisma to avoid database dependencies.
 */

const codeTemplateService = require('../src/services/codeTemplateService');
const { prisma } = require('../src/config/database');

// Mock Prisma
const mockPrisma = {
    questionTemplate: {
        findUnique: async () => ({
            language: 'cpp',
            headerCode: '#include <iostream>\nusing namespace std;',
            definition: 'struct ListNode { int val; ListNode *next; };',
            userFunction: 'ListNode* reverseList(ListNode* head) { ... }',
            mainFunction: 'int main() { ... }',
            boilerplate: '// No boilerplate'
        })
    }
};

// Monkey patch prisma (simplified for this script, in real tests use Jest)
prisma.questionTemplate = mockPrisma.questionTemplate;

async function testGeneration() {
    console.log('🧪 Testing CodeTemplateService...');

    try {
        const questionId = 'test-question-id';
        const language = 'cpp';
        const userFunctionCode = 'ListNode* reverseList(ListNode* head) {\n    // User implementation\n    return head;\n}';

        console.log('\n--- INPUT ---');
        console.log('Language:', language);
        console.log('User Code:\n', userFunctionCode);

        // Run generation
        const result = await codeTemplateService.generateExecutableCode(
            questionId,
            language,
            userFunctionCode
        );

        console.log('\n--- RESULT ---');
        console.log(result);

        // Verification
        console.log('\n--- VERIFICATION ---');

        const hasHeader = result.includes('#include <iostream>');
        const hasDefinition = result.includes('struct ListNode');
        const hasUserCode = result.includes('// User implementation');
        const hasMain = result.includes('int main()');

        console.log('Has Header:', hasHeader ? '✅' : '❌');
        console.log('Has Definition:', hasDefinition ? '✅' : '❌');
        console.log('Has User Code:', hasUserCode ? '✅' : '❌');
        console.log('Has Main:', hasMain ? '✅' : '❌');

        // Check order (rough check)
        const headerIndex = result.indexOf('#include');
        const defIndex = result.indexOf('struct ListNode');
        const userIndex = result.indexOf('// User implementation');
        const mainIndex = result.indexOf('int main()');

        const orderCorrect = headerIndex < defIndex && defIndex < userIndex && userIndex < mainIndex;
        console.log('Order Correct:', orderCorrect ? '✅' : '❌');

        if (hasHeader && hasDefinition && hasUserCode && hasMain && orderCorrect) {
            console.log('\n✨ TEST PASSED: Service correctly combines template parts!');
        } else {
            console.log('\n❌ TEST FAILED: Output missing parts or wrong order');
        }

    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

testGeneration();
