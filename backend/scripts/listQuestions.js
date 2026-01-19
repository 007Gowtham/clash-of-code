const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listQuestions() {
    const questions = await prisma.question.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            functionName: true,
            functionSignature: true
        }
    });

    console.log('📚 Questions in database:\n');
    questions.forEach(q => {
        console.log(`Title: ${q.title}`);
        console.log(`Slug: ${q.slug}`);
        console.log(`Function: ${q.functionName}`);
        console.log(`Signature: ${q.functionSignature}`);
        console.log('---');
    });

    await prisma.$disconnect();
}

listQuestions();
