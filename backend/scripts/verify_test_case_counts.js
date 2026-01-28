
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📊 Verifying Test Case Distribution...\n');

    const questions = await prisma.question.findMany({
        include: {
            testCases: true
        }
    });

    console.log(`Found ${questions.length} questions in database.\n`);

    console.log('--------------------------------------------------------------------------------');
    console.log(String('Question Title').padEnd(35) + '| ' + String('Samples').padEnd(10) + '| ' + String('Hidden').padEnd(10) + '| ' + String('Total').padEnd(10));
    console.log('--------------------------------------------------------------------------------');

    for (const q of questions) {
        const samples = q.testCases.filter(tc => tc.isSample).length;
        const hidden = q.testCases.filter(tc => !tc.isSample).length;
        const total = q.testCases.length;

        console.log(
            q.title.padEnd(35) + '| ' +
            String(samples).padEnd(10) + '| ' +
            String(hidden).padEnd(10) + '| ' +
            String(total).padEnd(10)
        );
    }
    console.log('--------------------------------------------------------------------------------');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
