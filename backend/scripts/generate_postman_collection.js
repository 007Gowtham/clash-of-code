
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const OUTPUT_FILE = 'Clash_of_Code_Full_Test.postman_collection.json';
const BASE_URL = 'http://localhost:5000'; // Change port if needed

const LANGUAGES = ['cpp', 'python', 'javascript', 'java'];

async function main() {
    console.log('🚀 Generating Postman Collection...');

    const questions = await prisma.question.findMany({
        include: {
            templates: true
        }
    });

    console.log(`📚 Found ${questions.length} questions.`);

    const collection = {
        info: {
            name: "Clash of Code - Full Automation",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        variable: [
            {
                key: "baseUrl",
                value: BASE_URL,
                type: "string"
            }
        ],
        item: []
    };

    // 1. Add "Get All Questions" Request
    collection.item.push({
        name: "Get All Questions",
        request: {
            method: "GET",
            header: [],
            url: {
                raw: "{{baseUrl}}/api/questions",
                host: ["{{baseUrl}}"],
                path: ["api", "questions"]
            }
        }
    });

    // 2. Iterate Questions and create folders
    for (const q of questions) {
        const questionFolder = {
            name: q.title,
            item: []
        };

        for (const lang of LANGUAGES) {
            const langFolder = {
                name: lang.toUpperCase(), // C++, PYTHON, etc.
                item: []
            };

            // Find template for this language
            const template = q.templates.find(t => t.language === lang);
            const userFunctionCode = template ? template.userFunction : "// No template found";

            // Run Request
            langFolder.item.push({
                name: `Run (${lang})`,
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
                            userFunctionCode: userFunctionCode,
                            language: lang
                        }, null, 4)
                    },
                    url: {
                        raw: `{{baseUrl}}/api/submissions/run-function/${q.id}`,
                        host: ["{{baseUrl}}"],
                        path: ["api", "submissions", "run-function", q.id]
                    }
                }
            });

            // Submit Request
            langFolder.item.push({
                name: `Submit (${lang})`,
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
                            userFunctionCode: userFunctionCode,
                            language: lang
                        }, null, 4)
                    },
                    url: {
                        raw: `{{baseUrl}}/api/submissions/submit-function/${q.id}`,
                        host: ["{{baseUrl}}"],
                        path: ["api", "submissions", "submit-function", q.id]
                    }
                }
            });

            questionFolder.item.push(langFolder);
        }

        collection.item.push(questionFolder);
    }

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collection, null, 4));
    console.log(`✅ Collection saved to ${OUTPUT_FILE}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
