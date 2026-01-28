/**
 * Diagnostic script to check question ID
 */

const { prisma } = require('../src/config/database');

async function checkQuestion() {
    const questionId = '9a0fabd-ec7c-4f24-aa4d-ca749c0773a5';

    console.log('🔍 Checking question ID:', questionId);
    console.log('ID length:', questionId.length);
    console.log('ID format check:', /^[0-9a-f]{7}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(questionId));

    // Try to find the question
    const question = await prisma.question.findUnique({
        where: { id: questionId }
    });

    console.log('\n📊 Result:', question ? '✅ Found' : '❌ Not found');

    if (question) {
        console.log('Question:', question.title);
    } else {
        // List all questions to find the correct ID
        console.log('\n📚 Available questions:');
        const allQuestions = await prisma.question.findMany({
            select: {
                id: true,
                title: true,
                slug: true
            },
            take: 10
        });

        allQuestions.forEach((q, idx) => {
            console.log(`${idx + 1}. ${q.title}`);
            console.log(`   ID: ${q.id}`);
            console.log(`   Slug: ${q.slug}\n`);
        });
    }

    await prisma.$disconnect();
}

checkQuestion().catch(console.error);
