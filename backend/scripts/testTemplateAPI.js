const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTemplateAPI() {
    console.log('🧪 Testing Template API Integration...\n');

    try {
        // Find a question with a proper slug
        const question = await prisma.question.findFirst({
            where: {
                slug: {
                    not: null
                }
            },
            include: {
                templates: true
            }
        });

        if (!question) {
            console.log('❌ No questions with slug found');
            return;
        }

        console.log(`📝 Testing with: ${question.title} (${question.slug})\n`);

        // Simulate what the API endpoint does
        const languages = ['cpp', 'java', 'python', 'javascript'];

        for (const language of languages) {
            const template = question.templates.find(t => t.language === language);

            if (template) {
                const codeTemplate = (template.headerCode ? template.headerCode + '\n' : '') + template.starterCode;

                console.log(`✅ ${language.toUpperCase()}:`);
                console.log(`   Length: ${codeTemplate.length} characters`);
                console.log(`   Has header: ${template.headerCode ? 'Yes' : 'No'}`);
                console.log(`   Has driver: ${template.driverCode ? 'Yes' : 'No'}`);
                console.log(`   Preview:`);
                console.log(`   ${codeTemplate.split('\n').slice(0, 3).join('\n   ')}`);
                console.log('');
            } else {
                console.log(`❌ ${language.toUpperCase()}: No template found`);
            }
        }

        console.log('\n🎯 API Endpoint Test:');
        console.log(`   GET /api/problems/${question.slug}?language=cpp`);
        console.log(`   Expected: Returns headerCode + starterCode as codeTemplate`);
        console.log(`   Status: ✅ Ready to test in browser\n`);

        console.log('📋 Test Instructions:');
        console.log('   1. Open browser to code editor page');
        console.log(`   2. Select question: "${question.title}"`);
        console.log('   3. Switch between languages (C++, Java, Python, JavaScript)');
        console.log('   4. Verify code template loads correctly');
        console.log('   5. Write solution and click "Run"');
        console.log('   6. Verify execution works\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTemplateAPI();
