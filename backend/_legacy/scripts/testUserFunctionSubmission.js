/**
 * Test script for User Function Submission Service
 * Tests the generateExecutableCode method with a sample question
 */

const templateGenerationService = require('../src/services/wrapperGeneration/TemplateGenerationService');
const { prisma } = require('../src/config/database');

async function testUserFunctionSubmission() {
    try {
        console.log('🧪 Testing User Function Submission Service\n');

        // Get a sample question from the database
        const question = await prisma.question.findFirst({
            where: {
                functionName: { not: null },
                inputType: { not: null },
                outputType: { not: null }
            }
        });

        if (!question) {
            console.error('❌ No suitable question found in database');
            process.exit(1);
        }

        console.log(`📝 Testing with question: ${question.title}`);
        console.log(`   Function: ${question.functionName}`);
        console.log(`   Input Type: ${question.inputType}`);
        console.log(`   Output Type: ${question.outputType}\n`);

        // Sample user function code for each language
        const userFunctions = {
            python: `def ${question.functionName}(nums, target):
    # Sample implementation
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,

            javascript: `function ${question.functionName}(nums, target) {
    // Sample implementation
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`,

            cpp: `vector<int> ${question.functionName}(vector<int>& nums, int target) {
    // Sample implementation
    for (int i = 0; i < nums.size(); i++) {
        for (int j = i + 1; j < nums.size(); j++) {
            if (nums[i] + nums[j] == target) {
                return {i, j};
            }
        }
    }
    return {};
}`,

            java: `public int[] ${question.functionName}(int[] nums, int target) {
    // Sample implementation
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[0];
}`
        };

        // Test each language
        const languages = ['python', 'javascript', 'cpp', 'java'];
        let successCount = 0;

        for (const language of languages) {
            try {
                console.log(`\n🔧 Testing ${language.toUpperCase()}...`);

                const executableCode = await templateGenerationService.generateExecutableCode(
                    question.id,
                    language,
                    userFunctions[language]
                );

                console.log(`✅ Generated executable code (${executableCode.length} chars)`);
                console.log(`\n--- Generated Code Preview (first 500 chars) ---`);
                console.log(executableCode.substring(0, 500));
                console.log(`--- End Preview ---\n`);

                successCount++;
            } catch (error) {
                console.error(`❌ Failed for ${language}:`, error.message);
            }
        }

        console.log(`\n📊 Test Results: ${successCount}/${languages.length} languages succeeded`);

        if (successCount === languages.length) {
            console.log('✅ All tests passed!');
        } else {
            console.log('⚠️  Some tests failed');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testUserFunctionSubmission()
    .then(() => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
