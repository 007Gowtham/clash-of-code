const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTemplates() {
    try {
        const questions = await prisma.question.findMany({
            include: {
                templates: true
            }
        });

        console.log(`Found ${questions.length} questions.`);
        questions.forEach(q => {
            console.log(`Question: ${q.title} (${q.slug})`);
            console.log(`Templates: ${q.templates.length}`);
            q.templates.forEach(t => {
                console.log(` - ${t.language}: UserFunc Length=${t.userFunction ? t.userFunction.length : 0}`);
            });
            console.log('---');
        });

    } catch (error) {
        console.error('Error checking templates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTemplates();
