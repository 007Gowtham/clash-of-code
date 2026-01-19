/**
 * Test Code Execution Setup
 * Verifies that questions have test cases ready for execution
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSetup() {
    console.log('🔍 Checking code execution setup...\n');

    try {
        // 1. Check for questions
        const questionCount = await prisma.question.count();
        console.log(`📚 Total questions in database: ${questionCount}`);

        if (questionCount === 0) {
            console.log('❌ No questions found!');
            console.log('💡 Solution: Create a new room or run: node scripts/seedSampleQuestion.js\n');
            return;
        }

        // 2. Check for test cases
        const testCaseCount = await prisma.testCase.count();
        console.log(`🧪 Total test cases in database: ${testCaseCount}`);

        if (testCaseCount === 0) {
            console.log('❌ No test cases found!');
            console.log('💡 Solution: Create a new room or run: node scripts/seedSampleQuestion.js\n');
            return;
        }

        // 3. Check for sample test cases
        const sampleTestCaseCount = await prisma.testCase.count({
            where: { isSample: true }
        });
        console.log(`✨ Sample test cases: ${sampleTestCaseCount}`);

        if (sampleTestCaseCount === 0) {
            console.log('❌ No sample test cases found!');
            console.log('💡 Sample test cases are needed for "Run Code" functionality\n');
            return;
        }

        // 4. Show questions with test cases
        console.log('\n📋 Questions with test cases:\n');

        const questions = await prisma.question.findMany({
            include: {
                testCases: {
                    where: { isSample: true },
                    orderBy: { order: 'asc' }
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
        });

        questions.forEach((q, index) => {
            const sampleTests = q.testCases.length;
            const status = sampleTests > 0 ? '✅' : '❌';

            console.log(`${status} ${index + 1}. ${q.title} (${q.difficulty})`);
            console.log(`   Question ID: ${q.id}`);
            console.log(`   Room: ${q.room.name} (${q.room.status})`);
            console.log(`   Sample test cases: ${sampleTests}`);

            if (sampleTests > 0) {
                q.testCases.forEach((tc, i) => {
                    console.log(`     ${i + 1}. Input: ${tc.input.substring(0, 40)}...`);
                    console.log(`        Output: ${tc.output}`);
                });
            }
            console.log('');
        });

        // 5. Summary
        const readyQuestions = questions.filter(q => q.testCases.length > 0).length;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total Questions: ${questionCount}`);
        console.log(`Questions with sample test cases: ${readyQuestions}`);
        console.log(`Total sample test cases: ${sampleTestCaseCount}`);

        if (readyQuestions > 0) {
            console.log('\n✅ Code execution is ready to use!');
            console.log('💡 You can now run and submit code in the frontend.\n');
        } else {
            console.log('\n❌ No questions are ready for code execution');
            console.log('💡 Create a new room or run: node scripts/seedSampleQuestion.js\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testSetup();
