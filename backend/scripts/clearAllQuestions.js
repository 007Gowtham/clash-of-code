/**
 * Clear All Questions Script
 * 
 * Removes all questions and related data (templates, test cases, submissions)
 * from the database.
 * 
 * Usage: node scripts/clearAllQuestions.js
 */

const { prisma } = require('../src/config/database');

async function clearDatabase() {
    console.log('🗑️  Starting database cleanup...');

    try {
        // Delete all questions
        // Cascading deletes will handle:
        // - QuestionTemplates
        // - TestCases
        // - Hints
        // - Constraints
        // - Submissions
        // - QuestionAssignments

        console.log('   Deleting all questions...');
        const deleteResult = await prisma.question.deleteMany({});

        console.log(`   Deleted ${deleteResult.count} questions.`);

        // Also verify other tables are empty just in case
        const templateCount = await prisma.questionTemplate.count();
        const testCaseCount = await prisma.testCase.count();
        const submissionCount = await prisma.submission.count();

        console.log('\n   Verification:');
        console.log(`   Templates remaining: ${templateCount}`);
        console.log(`   TestCases remaining: ${testCaseCount}`);
        console.log(`   Submissions remaining: ${submissionCount}`);

        if (templateCount === 0 && testCaseCount === 0 && submissionCount === 0) {
            console.log('\n✨ Database successfully cleared of all question data!');
        } else {
            // If not cascade, manually delete?
            // Usually configured in schema.
            if (templateCount > 0) await prisma.questionTemplate.deleteMany({});
            if (testCaseCount > 0) await prisma.testCase.deleteMany({});
            if (submissionCount > 0) await prisma.submission.deleteMany({});
            console.log('\n✨ Database cleared (manual cleanup needed for some relations).');
        }

    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
