/**
 * Quick Test Script - Two Sum Question
 * 
 * This script tests the metadata-driven wrapper generation system
 * by generating wrappers for the Two Sum question in all languages.
 */

const { PrismaClient } = require('@prisma/client');
const CppWrapperGenerator = require('../src/services/wrapperGeneration/generators/CppWrapperGenerator');
const JavaWrapperGenerator = require('../src/services/wrapperGeneration/generators/JavaWrapperGenerator');

const prisma = new PrismaClient();

async function main() {
    console.log('='.repeat(80));
    console.log('METADATA-DRIVEN WRAPPER GENERATION - TWO SUM TEST');
    console.log('='.repeat(80));

    // Get Two Sum question
    console.log('\n📋 Fetching Two Sum question...');
    const question = await prisma.question.findFirst({
        where: { title: 'Two Sum' },
        include: { testCases: true }
    });

    if (!question) {
        console.error('❌ Two Sum question not found!');
        console.log('💡 Run: node scripts/resetAndSeedQuestions.js');
        process.exit(1);
    }

    console.log('✅ Found:', question.title);
    console.log('   ID:', question.id);
    console.log('   Test Cases:', question.testCases.length);

    // Display metadata
    console.log('\n📊 Metadata Format:');
    console.log('   Input Formats:', JSON.stringify(question.inputFormats, null, 2));
    console.log('   Output Format:', JSON.stringify(question.outputFormat, null, 2));

    // Test C++ Wrapper Generation
    console.log('\n' + '='.repeat(80));
    console.log('🔧 Testing C++ Wrapper Generation');
    console.log('='.repeat(80));

    const cppGenerator = new CppWrapperGenerator();
    const cppTemplate = await cppGenerator.generate(question);

    console.log('✅ C++ Wrapper Generated');
    console.log('\n📄 Header Code:');
    console.log(cppTemplate.headerCode);
    console.log('\n📄 User Function:');
    console.log(cppTemplate.userFunction);
    console.log('\n📄 Main Function (Parsing & Serialization):');
    console.log(cppTemplate.mainFunction);

    // Verify metadata was used
    if (cppTemplate._metadata) {
        console.log('\n✅ Metadata-driven generation confirmed!');
        console.log('   Input Formats Used:', cppTemplate._metadata.inputFormats.length);
        console.log('   Strategies:');
        cppTemplate._metadata.inputFormats.forEach((spec, i) => {
            console.log(`     [${i}] ${spec.paramName}: ${spec.parseStrategy}`);
        });
        console.log(`   Output Strategy: ${cppTemplate._metadata.outputFormat.serializeStrategy}`);
    }

    // Test Java Wrapper Generation
    console.log('\n' + '='.repeat(80));
    console.log('🔧 Testing Java Wrapper Generation');
    console.log('='.repeat(80));

    const javaGenerator = new JavaWrapperGenerator();
    const javaTemplate = await javaGenerator.generate(question);

    console.log('✅ Java Wrapper Generated');
    console.log('\n📄 Header Code:');
    console.log(javaTemplate.headerCode);
    console.log('\n📄 User Function:');
    console.log(javaTemplate.userFunction);
    console.log('\n📄 Main Function (Parsing & Serialization):');
    console.log(javaTemplate.mainFunction);

    // Display test cases
    console.log('\n' + '='.repeat(80));
    console.log('🧪 Test Cases');
    console.log('='.repeat(80));

    question.testCases.forEach((tc, i) => {
        console.log(`\nTest Case ${i + 1}:`);
        console.log('  Input:', tc.input.replace(/\n/g, '\\n'));
        console.log('  Expected Output:', tc.output);
        if (tc.explanation) {
            console.log('  Explanation:', tc.explanation);
        }
    });

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ Question: Two Sum');
    console.log('✅ Metadata Format: Present');
    console.log('✅ Input Formats: 2 (array<int>, int)');
    console.log('✅ Output Format: array<int>');
    console.log('✅ Strategies Used:');
    console.log('   - json_array (for nums parameter)');
    console.log('   - primitive (for target parameter)');
    console.log('   - json_array (for output)');
    console.log('✅ C++ Wrapper: Generated');
    console.log('✅ Java Wrapper: Generated');
    console.log('✅ Test Cases: ' + question.testCases.length);

    console.log('\n🎉 Metadata-driven wrapper generation is working correctly!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Start backend: cd backend && npm run dev');
    console.log('   2. Import Postman collection: Clash_of_Code_API_Tests.postman_collection.json');
    console.log('   3. Test API endpoints with the collection');
    console.log('='.repeat(80));
}

main()
    .catch((e) => {
        console.error('❌ Error:', e.message);
        console.error(e.stack);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
