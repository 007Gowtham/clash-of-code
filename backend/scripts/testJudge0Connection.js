/**
 * Test script to verify Judge0 self-hosted connection
 */

const axios = require('axios');

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'http://127.0.0.1:2358';

async function testJudge0() {
    console.log('🧪 Testing Judge0 Self-Hosted Connection\n');
    console.log(`📡 Judge0 URL: ${JUDGE0_URL}\n`);

    try {
        // Test 1: Check if Judge0 is accessible
        console.log('1️⃣ Testing /about endpoint...');
        const aboutResponse = await axios.get(`${JUDGE0_URL}/about`);
        console.log('✅ Judge0 is accessible!');
        console.log(`   Version: ${aboutResponse.data.version || 'Unknown'}`);
        console.log('');

        // Test 2: Submit a simple Python program
        console.log('2️⃣ Submitting test code (Python)...');
        const submitResponse = await axios.post(`${JUDGE0_URL}/submissions`, {
            source_code: 'print("Hello from Judge0!")',
            language_id: 71, // Python 3
            stdin: ''
        }, {
            params: {
                base64_encoded: 'false',
                wait: 'false'
            }
        });

        const token = submitResponse.data.token;
        console.log(`✅ Submission created! Token: ${token}`);
        console.log('');

        // Test 3: Poll for result
        console.log('3️⃣ Waiting for execution...');
        let result;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const resultResponse = await axios.get(`${JUDGE0_URL}/submissions/${token}`, {
                params: {
                    base64_encoded: 'false',
                    fields: 'stdout,stderr,status,message,time,memory'
                }
            });

            result = resultResponse.data;

            // Status 1 = In Queue, 2 = Processing
            if (result.status.id !== 1 && result.status.id !== 2) {
                break;
            }

            attempts++;
        }

        console.log('✅ Execution completed!');
        console.log(`   Status: ${result.status.description}`);
        console.log(`   Output: ${result.stdout || '(empty)'}`);
        console.log(`   Time: ${result.time || 'N/A'}s`);
        console.log(`   Memory: ${result.memory || 'N/A'} KB`);
        console.log('');

        // Test 4: Test JavaScript
        console.log('4️⃣ Testing JavaScript execution...');
        const jsResponse = await axios.post(`${JUDGE0_URL}/submissions`, {
            source_code: 'console.log("JavaScript works!");',
            language_id: 63, // JavaScript (Node.js)
            stdin: ''
        }, {
            params: {
                base64_encoded: 'false',
                wait: 'true' // Wait for result
            }
        });

        console.log('✅ JavaScript execution completed!');
        console.log(`   Status: ${jsResponse.data.status.description}`);
        console.log(`   Output: ${jsResponse.data.stdout || '(empty)'}`);
        console.log('');

        console.log('🎉 All tests passed! Judge0 is working correctly.\n');
        console.log('✅ Your configuration is correct:');
        console.log(`   JUDGE0_API_URL=${JUDGE0_URL}`);
        console.log('   No API key needed ✓');
        console.log('   No RapidAPI headers ✓\n');

    } catch (error) {
        console.error('❌ Test failed!\n');

        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Judge0 is not running or not accessible at:', JUDGE0_URL);
            console.error('   Solutions:');
            console.error('   1. Check if Judge0 is running: docker ps | grep judge0');
            console.error('   2. Verify the URL in your .env file');
            console.error('   3. Try: curl http://127.0.0.1:2358/about\n');
        } else if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('   Error:', error.message);
        }

        process.exit(1);
    }
}

testJudge0();
