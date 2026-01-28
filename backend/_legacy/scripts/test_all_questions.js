
const { PrismaClient } = require('@prisma/client');
const submissionController = require('../src/controllers/submissionController');
const questionController = require('../src/controllers/questionController');
const templateGenerationService = require('../src/services/wrapperGeneration/TemplateGenerationService');

// Initialize Prisma
const prisma = new PrismaClient();

// Mock Express Req/Res
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        res.statusMessage = code === 200 ? 'OK' : 'Error';
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    res.send = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function main() {
    console.log('🚀 Starting Test Script: Run & Submit All Questions');

    // 0. Generate Templates (Ensure they exist)
    console.log('🔄 Generative Templates for all questions...');
    try {
        const generationResult = await templateGenerationService.generateAllTemplates();
        if (generationResult.failed > 0) {
            console.log('❌ Template Generation Errors:');
            generationResult.errors.forEach(err => {
                console.log(`[${err.title}] Error: ${err.error}`);
            });
        } else {
            console.log('✅ Templates generated successfully.');
        }
    } catch (e) {
        console.error('⚠️ Template generation threw:', e.message);
    }

    // 1. Ensure Test User Exists
    const TEST_USER_ID = 'TEST_USER_ID';
    console.log(`👤 Upserting Test User with ID: ${TEST_USER_ID}`);
    try {
        await prisma.user.upsert({
            where: { id: TEST_USER_ID },
            update: {},
            create: {
                id: TEST_USER_ID,
                username: 'TestUser',
                email: 'tester@example.com',
                password: 'password123', // Dummy
                role: 'USER',
                isEmailVerified: true
            }
        });
        console.log('✅ Test User ready.');
    } catch (err) {
        console.error('❌ Failed to create test user:', err);
        process.exit(1);
    }

    // 2. Fetch All Questions
    console.log('📚 Fetching all questions...');
    const questions = await prisma.question.findMany({
        include: {
            templates: true
        }
    });
    console.log(`✅ Found ${questions.length} questions.`);

    let passedRuns = 0;
    let failedRuns = 0;
    let passedSubmits = 0;
    let failedSubmits = 0;

    // 3. Loop and Test
    for (const q of questions) {
        console.log(`\n--------------------------------------------------`);
        console.log(`Testing Question: ${q.title} (ID: ${q.id})`);

        // Get JavaScript template (defaulting to JS for now)
        const template = q.templates.find(t => t.language === 'javascript');
        if (!template) {
            console.log(`⚠️ No JavaScript template found. Available templates: ${JSON.stringify(q.templates)}`);
            continue;
        }

        const userFunctionCode = template.userFunction || '// No user function in template';

        // --- TEST RUN (Sample Cases) ---
        console.log(`▶️ Running Code (Run Function)...`);
        const reqRun = {
            params: { questionId: q.id },
            body: {
                userFunctionCode: userFunctionCode,
                language: 'javascript'
            },
            // No user needed for run-function often, but good to have
            user: { id: TEST_USER_ID }
        };
        const resRun = mockRes();

        try {
            await submissionController.runUserFunction(reqRun, resRun, (err) => {
                throw err;
            });

            if (resRun.statusCode >= 200 && resRun.statusCode < 300) {
                console.log(`✅ Run Verified: ${resRun.data.verdict || 'OK'}`);
                if (resRun.data.verdict === 'ACCEPTED') passedRuns++; // Unlikely with boilerplate
                else passedRuns++; // We count successful EXECUTION (no 500) as pass for this system test
            } else {
                console.error(`❌ Run Failed (Status ${resRun.statusCode}):`, resRun.data);
                failedRuns++;
            }
        } catch (error) {
            console.error(`❌ Run Exception:`, error.message);
            failedRuns++;
        }

        // --- TEST SUBMIT (All Cases) ---
        console.log(`▶️ Submitting Code (Submit Function)...`);
        const reqSubmit = {
            params: { questionId: q.id },
            body: {
                userFunctionCode: userFunctionCode,
                language: 'javascript'
            },
            user: { id: TEST_USER_ID } // Controller usage relies on this or fallback
        };
        const resSubmit = mockRes();

        try {
            await submissionController.submitUserFunction(reqSubmit, resSubmit, (err) => {
                throw err;
            });

            if (resSubmit.statusCode >= 200 && resSubmit.statusCode < 300) {
                console.log(`✅ Submit Verified: ${resSubmit.data.verdict || 'OK'}`);
                passedSubmits++;
            } else {
                console.error(`❌ Submit Failed (Status ${resSubmit.statusCode}):`, resSubmit.data);
                failedSubmits++;
            }
        } catch (error) {
            console.error(`❌ Submit Exception:`, error.message);
            failedSubmits++;
        }
    }

    console.log(`\n==================================================`);
    console.log(`SUMMARY:`);
    console.log(`Runs: ${passedRuns} Passed / ${failedRuns} Failed`);
    console.log(`Submits: ${passedSubmits} Passed / ${failedSubmits} Failed`);
    console.log(`==================================================`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
