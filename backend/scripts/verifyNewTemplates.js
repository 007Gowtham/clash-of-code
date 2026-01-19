const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Verifying New Template Fields...\n');
    try {
        const templates = await prisma.questionTemplate.findMany({
            include: { question: { select: { slug: true } } }
        });

        console.log(`Found ${templates.length} templates.`);

        let errorCount = 0;
        for (const t of templates) {
            const missing = [];
            if (!t.userFunction) missing.push('userFunction');
            // headerCode/boilerplate might be empty for some languages?
            // Java/Cpp have them. JS might have empty headerCode?

            if (t.language === 'cpp' && !t.headerCode) missing.push('headerCode (cpp)');
            if (t.language === 'java' && !t.headerCode) missing.push('headerCode (java)');

            if (missing.length > 0) {
                console.error(`❌ Template for ${t.question.slug} (${t.language}) missing: ${missing.join(', ')}`);
                errorCount++;
            }
        }

        if (errorCount === 0) {
            console.log('\n✅ All templates valid!');
        } else {
            console.error(`\n❌ Found ${errorCount} invalid templates.`);
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
