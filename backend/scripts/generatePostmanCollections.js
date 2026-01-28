/**
 * Generate Postman collections with actual boilerplate code from templates
 * (Like LeetCode - shows function signature without solution)
 */

const { prisma } = require('../src/config/database');
const fs = require('fs');

async function generatePostmanCollections() {
    console.log('🔨 Generating Postman collections with boilerplate code...\n');

    // Read validation results
    const results = JSON.parse(fs.readFileSync('/home/aswin/Music/backend/validation-results.json', 'utf8'));

    // Create Run Function collection
    const runFunctionCollection = {
        info: {
            name: "Code Execution - Run Function (All Questions)",
            description: "Test all valid questions with boilerplate code (fill in your solution)",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: []
    };

    // Create Submit Function collection
    const submitFunctionCollection = {
        info: {
            name: "Code Execution - Submit Function (All Questions)",
            description: "Submit solutions for all valid questions",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: []
    };

    // Group questions by title
    const questionsByTitle = {};
    results.valid.forEach(q => {
        if (!questionsByTitle[q.title]) {
            questionsByTitle[q.title] = [];
        }
        questionsByTitle[q.title].push(q);
    });

    console.log(`📊 Processing ${Object.keys(questionsByTitle).length} unique questions\n`);

    // Generate requests for each question
    for (const [title, questions] of Object.entries(questionsByTitle)) {
        const question = questions[0]; // Use first instance

        console.log(`📝 ${title} (${question.id})`);

        // Fetch templates from database
        const templates = await prisma.questionTemplate.findMany({
            where: { questionId: question.id },
            select: {
                language: true,
                userFunction: true
            }
        });

        if (templates.length === 0) {
            console.log(`   ⚠️  No templates found, skipping`);
            continue;
        }

        // Create folder for this question
        const runFolder = {
            name: title,
            item: []
        };

        const submitFolder = {
            name: title,
            item: []
        };

        // Add requests for each language
        for (const template of templates) {
            const lang = template.language;
            const boilerplate = template.userFunction;

            console.log(`   ✅ ${lang.toUpperCase()}`);

            // Run Function request
            runFolder.item.push({
                name: `${title} - ${lang.toUpperCase()}`,
                request: {
                    method: "POST",
                    header: [
                        {
                            key: "Content-Type",
                            value: "application/json"
                        }
                    ],
                    body: {
                        mode: "raw",
                        raw: JSON.stringify({
                            userFunctionCode: boilerplate,
                            language: lang
                        }, null, 2)
                    },
                    url: {
                        raw: `http://localhost:3004/api/submissions/run-function/${question.id}`,
                        protocol: "http",
                        host: ["localhost"],
                        port: "3004",
                        path: ["api", "submissions", "run-function", question.id]
                    }
                },
                response: []
            });

            // Submit Function request
            submitFolder.item.push({
                name: `${title} - ${lang.toUpperCase()}`,
                request: {
                    method: "POST",
                    header: [
                        {
                            key: "Content-Type",
                            value: "application/json"
                        }
                    ],
                    body: {
                        mode: "raw",
                        raw: JSON.stringify({
                            userFunctionCode: boilerplate,
                            language: lang
                        }, null, 2)
                    },
                    url: {
                        raw: `http://localhost:3004/api/submissions/submit-function/${question.id}`,
                        protocol: "http",
                        host: ["localhost"],
                        port: "3004",
                        path: ["api", "submissions", "submit-function", question.id]
                    }
                },
                response: []
            });
        }

        runFunctionCollection.item.push(runFolder);
        submitFunctionCollection.item.push(submitFolder);
    }

    // Save collections
    fs.writeFileSync(
        '/home/aswin/Music/backend/postman/Run_Function_All_Questions.postman_collection.json',
        JSON.stringify(runFunctionCollection, null, 2)
    );

    fs.writeFileSync(
        '/home/aswin/Music/backend/postman/Submit_Function_All_Questions.postman_collection.json',
        JSON.stringify(submitFunctionCollection, null, 2)
    );

    console.log('\n✅ Generated Postman collections:');
    console.log('   - Run_Function_All_Questions.postman_collection.json');
    console.log('   - Submit_Function_All_Questions.postman_collection.json');
    console.log(`\n📊 Total folders: ${Object.keys(questionsByTitle).length}`);
    console.log(`   Each folder has requests for all available languages`);
    console.log(`   Boilerplate code included (like LeetCode)`);

    await prisma.$disconnect();
}

generatePostmanCollections().catch(console.error);
