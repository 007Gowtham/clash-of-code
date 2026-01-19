const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTemplates() {
    console.log('🔍 Verifying Question Templates...\n');

    try {
        // Count total templates
        const totalTemplates = await prisma.questionTemplate.count();
        console.log(`📊 Total Templates: ${totalTemplates}`);

        // Count by language
        const languages = ['cpp', 'java', 'python', 'javascript'];
        for (const lang of languages) {
            const count = await prisma.questionTemplate.count({
                where: { language: lang }
            });
            console.log(`   ${lang.toUpperCase()}: ${count} templates`);
        }

        // Show sample templates
        console.log('\n📝 Sample Templates:\n');
        const samples = await prisma.questionTemplate.findMany({
            take: 3,
            include: {
                question: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            }
        });

        samples.forEach(template => {
            console.log(`   ✓ ${template.question.title} (${template.language})`);
            console.log(`     Slug: ${template.question.slug}`);
            console.log(`     Header: ${template.headerCode ? 'Yes' : 'No'}`);
            console.log(`     Starter: ${template.starterCode.substring(0, 50)}...`);
            console.log(`     Driver: ${template.driverCode.substring(0, 50)}...`);
            console.log('');
        });

        // Check for questions without templates
        const questionsWithoutTemplates = await prisma.question.findMany({
            where: {
                templates: {
                    none: {}
                }
            },
            select: {
                id: true,
                title: true,
                slug: true
            }
        });

        if (questionsWithoutTemplates.length > 0) {
            console.log(`⚠️  Questions without templates: ${questionsWithoutTemplates.length}`);
            questionsWithoutTemplates.slice(0, 5).forEach(q => {
                console.log(`   - ${q.title} (${q.slug})`);
            });
        } else {
            console.log('✅ All questions have templates!');
        }

        console.log('\n✅ Verification complete!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyTemplates();
