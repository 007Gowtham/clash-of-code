/**
 * Comprehensive Wrapper Validation Script
 * Validates all generated wrappers against master prompt requirements
 */

const CppGen = require('../src/services/wrapperGeneration/generators/CppWrapperGenerator');
const PythonGen = require('../src/services/wrapperGeneration/generators/PythonWrapperGenerator');
const JavaScriptGen = require('../src/services/wrapperGeneration/generators/JavaScriptWrapperGenerator');
const JavaGen = require('../src/services/wrapperGeneration/generators/JavaWrapperGenerator');

// Test questions for each type
const testQuestions = {
    arrayReturn: {
        id: 'test-array',
        functionName: 'twoSum',
        inputType: JSON.stringify(['array<int>', 'int']),
        outputType: JSON.stringify('array<int>'),
        functionSignature: JSON.stringify({
            returnType: 'vector<int>',
            params: [
                { type: 'vector<int>&', name: 'nums' },
                { type: 'int', name: 'target' }
            ]
        })
    },
    booleanReturn: {
        id: 'test-boolean',
        functionName: 'isValid',
        inputType: JSON.stringify(['string']),
        outputType: JSON.stringify('boolean'),
        functionSignature: JSON.stringify({
            returnType: 'bool',
            params: [{ type: 'string', name: 's' }]
        })
    },
    treeReturn: {
        id: 'test-tree',
        functionName: 'invertTree',
        inputType: JSON.stringify(['tree']),
        outputType: JSON.stringify('tree'),
        functionSignature: JSON.stringify({
            returnType: 'TreeNode*',
            params: [{ type: 'TreeNode*', name: 'root' }]
        })
    }
};

const generators = {
    cpp: new CppGen(),
    python: new PythonGen(),
    javascript: new JavaScriptGen(),
    java: new JavaGen()
};

console.log('🔍 COMPREHENSIVE WRAPPER VALIDATION\n');
console.log('═'.repeat(80));

let totalTests = 0;
let passedTests = 0;
const failures = [];

function test(name, condition, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`✅ ${name}`);
        return true;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
        failures.push({ name, details });
        return false;
    }
}

// Test each language
for (const [lang, gen] of Object.entries(generators)) {
    console.log(`\n${'▓'.repeat(80)}`);
    console.log(`▓  ${lang.toUpperCase()} VALIDATION`);
    console.log(`${'▓'.repeat(80)}\n`);

    // Test 1: Definition always includes both structures
    const def = gen.generateDefinition({});
    test(
        `${lang}: Definition includes ListNode`,
        def.includes('ListNode'),
        'ListNode not found in definition'
    );
    test(
        `${lang}: Definition includes TreeNode`,
        def.includes('TreeNode'),
        'TreeNode not found in definition'
    );

    // Test 2: No leading indentation in definition (Java specific)
    if (lang === 'java') {
        const firstLine = def.split('\n')[0];
        test(
            `${lang}: Definition has no leading indentation`,
            !firstLine.startsWith('    '),
            `First line starts with spaces: "${firstLine}"`
        );
    }

    // Test 3: Correct placeholder returns
    const arrayQuestion = testQuestions.arrayReturn;
    const boolQuestion = testQuestions.booleanReturn;
    const treeQuestion = testQuestions.treeReturn;

    const arrayFunc = gen.generateUserFunction(arrayQuestion);
    const boolFunc = gen.generateUserFunction(boolQuestion);
    const treeFunc = gen.generateUserFunction(treeQuestion);

    const expectedArrayReturn = {
        cpp: 'return {};',
        python: 'return []',
        javascript: 'return [];',
        java: 'return new int[0];'
    };

    const expectedBoolReturn = {
        cpp: 'return false;',
        python: 'return False',
        javascript: 'return false;',
        java: 'return false;'
    };

    const expectedTreeReturn = {
        cpp: 'return nullptr;',
        python: 'return None',
        javascript: 'return null;',
        java: 'return null;'
    };

    test(
        `${lang}: Array return placeholder is correct`,
        arrayFunc.includes(expectedArrayReturn[lang]),
        `Expected "${expectedArrayReturn[lang]}", got: ${arrayFunc.match(/return [^;]+;?/)?.[0] || 'not found'}`
    );

    test(
        `${lang}: Boolean return placeholder is correct`,
        boolFunc.includes(expectedBoolReturn[lang]),
        `Expected "${expectedBoolReturn[lang]}", got: ${boolFunc.match(/return [^;]+;?/)?.[0] || 'not found'}`
    );

    test(
        `${lang}: Tree return placeholder is correct`,
        treeFunc.includes(expectedTreeReturn[lang]),
        `Expected "${expectedTreeReturn[lang]}", got: ${treeFunc.match(/return [^;]+;?/)?.[0] || 'not found'}`
    );

    // Test 4: Boilerplate is valid
    const headerCode = gen.generateHeaderCode();
    const boilerplate = gen.generateBoilerplate(headerCode, def);

    if (lang === 'java') {
        test(
            `${lang}: Boilerplate contains class wrapper`,
            boilerplate.includes('public class Solution'),
            'Boilerplate missing class wrapper'
        );
        test(
            `${lang}: Boilerplate has no orphaned static members`,
            !boilerplate.match(/^\s*static class/m) || boilerplate.includes('public class'),
            'Found orphaned static members outside class'
        );
    }

    // Test 5: Header code has all helpers
    test(
        `${lang}: Header has parseTree`,
        headerCode.includes('parseTree') || def.includes('parseTree'),
        'parseTree function not found'
    );

    test(
        `${lang}: Header has parseLinkedList`,
        headerCode.includes('parseLinkedList') || def.includes('parseLinkedList') || headerCode.includes('parse_linked_list'),
        'parseLinkedList function not found'
    );

    test(
        `${lang}: Header has serializeArray`,
        headerCode.includes('serializeArray') || def.includes('serializeArray') || headerCode.includes('serialize_array'),
        'serializeArray function not found'
    );

    // Test 6: Efficient string building (C++ and Java)
    if (lang === 'cpp') {
        test(
            `${lang}: Uses ostringstream for string building`,
            headerCode.includes('ostringstream') || def.includes('ostringstream'),
            'ostringstream not found'
        );
    }

    if (lang === 'java') {
        test(
            `${lang}: Uses StringBuilder for string building`,
            def.includes('StringBuilder'),
            'StringBuilder not found'
        );
    }

    // Test 7: Edge case handling
    const hasEdgeCaseCheck = (code) => {
        return code.includes('<= 0') || code.includes('== 0') || code.includes('length == 0') || code.includes('empty()');
    };

    test(
        `${lang}: Has edge case handling`,
        hasEdgeCaseCheck(headerCode) || hasEdgeCaseCheck(def),
        'No edge case checks found'
    );
}

// Final summary
console.log('\n' + '═'.repeat(80));
console.log('📊 VALIDATION SUMMARY');
console.log('═'.repeat(80));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${totalTests - passedTests} ❌`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failures.forEach((f, i) => {
        console.log(`${i + 1}. ${f.name}`);
        if (f.details) console.log(`   ${f.details}`);
    });
    process.exit(1);
} else {
    console.log('\n🎉 ALL TESTS PASSED! Wrappers are production-ready.');
    process.exit(0);
}
