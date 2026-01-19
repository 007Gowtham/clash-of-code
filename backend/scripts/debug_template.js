const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectTemplate() {
    try {
        // Find the question first
        const question = await prisma.question.findFirst({
            where: {
                title: {
                    contains: 'Reverse Linked List'
                }
            }
        });

        if (!question) {
            console.log('Question "Reverse Linked List" not found.');
            return;
        }

        console.log(`Found Question: ${question.title} (ID: ${question.id})`);

        // Find the template for JavaScript
        const template = await prisma.questionTemplate.findUnique({
            where: {
                questionId_language: {
                    questionId: question.id,
                    language: 'javascript'
                }
            }
        });

        if (!template) {
            console.log('Template not found for JavaScript.');
            return;
        }

        console.log('--- HEADER CODE ---');
        console.log(template.headerCode);
        console.log('\n--- DEFINITION ---');
        console.log(template.definition);
        console.log('\n--- USER FUNCTION ---');
        console.log(template.userFunction);
        console.log('\n--- MAIN FUNCTION (HARNESS) ---');
        console.log(template.mainFunction);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectTemplate();
