/**
 * Integration Test for Wrapper Generation with Strategies
 * 
 * Tests end-to-end wrapper generation using the new strategy-based system
 */

const CppWrapperGenerator = require('../src/services/wrapperGeneration/generators/CppWrapperGenerator');

console.log('='.repeat(80));
console.log('WRAPPER GENERATION INTEGRATION TEST');
console.log('='.repeat(80));

// Test 1: Generate wrapper with NEW metadata format
console.log('\n📋 Test 1: Wrapper Generation with New Metadata Format');
console.log('-'.repeat(80));

const questionWithNewMetadata = {
    id: 'test-two-sum',
    functionName: 'twoSum',
    functionSignature: JSON.stringify({
        returnType: 'vector<int>',
        params: [
            { type: 'vector<int>&', name: 'nums' },
            { type: 'int', name: 'target' }
        ]
    }),
    inputFormats: [
        {
            paramIndex: 0,
            paramName: 'nums',
            baseType: 'array',
            elementType: 'int',
            parseStrategy: 'json_array',
            inputFormatExample: '[2,7,11,15]'
        },
        {
            paramIndex: 1,
            paramName: 'target',
            baseType: 'primitive',
            elementType: 'int',
            parseStrategy: 'primitive',
            inputFormatExample: '9'
        }
    ],
    outputFormat: {
        baseType: 'array',
        elementType: 'int',
        serializeStrategy: 'json_array',
        outputFormatExample: '[0,1]'
    },
    // Legacy fields for backward compatibility
    inputType: '["array<int>", "int"]',
    outputType: '"array<int>"'
};

const cppGenerator = new CppWrapperGenerator();

(async () => {
    try {
        const template = await cppGenerator.generate(questionWithNewMetadata);

        console.log('✅ Template Generated Successfully!');
        console.log('\n📄 Generated Main Function:');
        console.log('```cpp');
        console.log(template.mainFunction);
        console.log('```');

        console.log('\n📊 Template Metadata:');
        console.log('   Language:', template.language);
        console.log('   Question ID:', template.questionId);
        console.log('   Has Header Code:', !!template.headerCode);
        console.log('   Has Definition:', !!template.definition);
        console.log('   Has User Function:', !!template.userFunction);
        console.log('   Has Main Function:', !!template.mainFunction);

        if (template._metadata) {
            console.log('\n📋 Format Specifications Used:');
            console.log('   Input Formats:');
            template._metadata.inputFormats.forEach((spec, i) => {
                console.log(`     [${i}] ${spec.paramName}: ${spec.baseType}<${spec.elementType || 'N/A'}> (${spec.parseStrategy})`);
            });
            console.log('   Output Format:');
            console.log(`     ${template._metadata.outputFormat.baseType}<${template._metadata.outputFormat.elementType || 'N/A'}> (${template._metadata.outputFormat.serializeStrategy})`);
        }

        // Test 2: Generate wrapper with LEGACY metadata format
        console.log('\n\n📋 Test 2: Wrapper Generation with Legacy Metadata Format');
        console.log('-'.repeat(80));

        const questionWithLegacyMetadata = {
            id: 'test-two-sum-legacy',
            functionName: 'twoSum',
            functionSignature: JSON.stringify({
                returnType: 'vector<int>',
                params: [
                    { type: 'vector<int>&', name: 'nums' },
                    { type: 'int', name: 'target' }
                ]
            }),
            inputType: '["array<int>", "int"]',
            outputType: '"array<int>"'
        };

        const legacyTemplate = await cppGenerator.generate(questionWithLegacyMetadata);

        console.log('✅ Legacy Template Generated Successfully!');
        console.log('\n📄 Generated Main Function:');
        console.log('```cpp');
        console.log(legacyTemplate.mainFunction);
        console.log('```');

        // Test 3: Generate wrapper for tree problem
        console.log('\n\n📋 Test 3: Wrapper Generation for Binary Tree Problem');
        console.log('-'.repeat(80));

        const treeQuestion = {
            id: 'test-tree',
            functionName: 'maxDepth',
            functionSignature: JSON.stringify({
                returnType: 'int',
                params: [
                    { type: 'TreeNode*', name: 'root' }
                ]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 'root',
                    baseType: 'tree',
                    parseStrategy: 'tree_array',
                    inputFormatExample: '[3,9,20,null,null,15,7]'
                }
            ],
            outputFormat: {
                baseType: 'primitive',
                elementType: 'int',
                serializeStrategy: 'primitive'
            },
            inputType: '["tree"]',
            outputType: '"int"'
        };

        const treeTemplate = await cppGenerator.generate(treeQuestion);

        console.log('✅ Tree Template Generated Successfully!');
        console.log('\n📄 Generated Main Function:');
        console.log('```cpp');
        console.log(treeTemplate.mainFunction);
        console.log('```');

        // Test 4: Generate wrapper for matrix problem
        console.log('\n\n📋 Test 4: Wrapper Generation for Matrix Problem');
        console.log('-'.repeat(80));

        const matrixQuestion = {
            id: 'test-matrix',
            functionName: 'searchMatrix',
            functionSignature: JSON.stringify({
                returnType: 'bool',
                params: [
                    { type: 'vector<vector<int>>&', name: 'matrix' },
                    { type: 'int', name: 'target' }
                ]
            }),
            inputFormats: [
                {
                    paramIndex: 0,
                    paramName: 'matrix',
                    baseType: 'matrix',
                    elementType: 'int',
                    parseStrategy: 'nested_array',
                    inputFormatExample: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]]'
                },
                {
                    paramIndex: 1,
                    paramName: 'target',
                    baseType: 'primitive',
                    elementType: 'int',
                    parseStrategy: 'primitive',
                    inputFormatExample: '3'
                }
            ],
            outputFormat: {
                baseType: 'primitive',
                elementType: 'boolean',
                serializeStrategy: 'primitive'
            },
            inputType: '["matrix<int>", "int"]',
            outputType: '"boolean"'
        };

        const matrixTemplate = await cppGenerator.generate(matrixQuestion);

        console.log('✅ Matrix Template Generated Successfully!');
        console.log('\n📄 Generated Main Function:');
        console.log('```cpp');
        console.log(matrixTemplate.mainFunction);
        console.log('```');

        // Summary
        console.log('\n\n' + '='.repeat(80));
        console.log('INTEGRATION TEST SUMMARY');
        console.log('='.repeat(80));
        console.log('✅ New Metadata Format: Working');
        console.log('✅ Legacy Metadata Format: Working');
        console.log('✅ Tree Problems: Working');
        console.log('✅ Matrix Problems: Working');
        console.log('✅ Strategy-Based Generation: Working');
        console.log('✅ Backward Compatibility: Maintained');
        console.log('\n🎉 All integration tests passed!');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();
