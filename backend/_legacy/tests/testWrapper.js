/**
 * Comprehensive Wrapper Generator Test Suite
 * Tests all data structure types across all 4 languages
 */

const CppGen = require('../src/services/wrapperGeneration/generators/CppWrapperGenerator');
const PythonGen = require('../src/services/wrapperGeneration/generators/PythonWrapperGenerator');
const JavaScriptGen = require('../src/services/wrapperGeneration/generators/JavaScriptWrapperGenerator');
const JavaGen = require('../src/services/wrapperGeneration/generators/JavaWrapperGenerator');

// Comprehensive test questions covering all data structures
const testQuestions = {
    // 1. Array Problem
    twoSum: {
        id: 'test-array',
        title: 'Two Sum',
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

    // 2. Matrix Problem
    spiralMatrix: {
        id: 'test-matrix',
        title: 'Spiral Matrix',
        functionName: 'spiralOrder',
        inputType: JSON.stringify(['matrix<int>']),
        outputType: JSON.stringify('array<int>'),
        functionSignature: JSON.stringify({
            returnType: 'vector<int>',
            params: [
                { type: 'vector<vector<int>>&', name: 'matrix' }
            ]
        })
    },

    // 3. Tree Problem
    levelOrder: {
        id: 'test-tree',
        title: 'Binary Tree Level Order Traversal',
        functionName: 'levelOrder',
        inputType: JSON.stringify(['tree']),
        outputType: JSON.stringify('matrix<int>'),
        functionSignature: JSON.stringify({
            returnType: 'vector<vector<int>>',
            params: [
                { type: 'TreeNode*', name: 'root' }
            ]
        })
    },

    // 4. Linked List Problem
    reverseList: {
        id: 'test-linkedlist',
        title: 'Reverse Linked List',
        functionName: 'reverseList',
        inputType: JSON.stringify(['linked_list']),
        outputType: JSON.stringify('linked_list'),
        functionSignature: JSON.stringify({
            returnType: 'ListNode*',
            params: [
                { type: 'ListNode*', name: 'head' }
            ]
        })
    },

    // 5. Graph Problem
    cloneGraph: {
        id: 'test-graph',
        title: 'Clone Graph',
        functionName: 'cloneGraph',
        inputType: JSON.stringify(['graph']),
        outputType: JSON.stringify('graph'),
        functionSignature: JSON.stringify({
            returnType: 'vector<vector<int>>',
            params: [
                { type: 'vector<vector<int>>&', name: 'graph' }
            ]
        })
    },

    // 6. String Problem
    isValid: {
        id: 'test-string',
        title: 'Valid Parentheses',
        functionName: 'isValid',
        inputType: JSON.stringify(['string']),
        outputType: JSON.stringify('boolean'),
        functionSignature: JSON.stringify({
            returnType: 'bool',
            params: [
                { type: 'string', name: 's' }
            ]
        })
    },

    // 7. Multiple Primitives
    isPalindrome: {
        id: 'test-primitives',
        title: 'Palindrome Number',
        functionName: 'isPalindrome',
        inputType: JSON.stringify(['int']),
        outputType: JSON.stringify('boolean'),
        functionSignature: JSON.stringify({
            returnType: 'bool',
            params: [
                { type: 'int', name: 'x' }
            ]
        })
    }
};

const generators = {
    cpp: new CppGen(),
    python: new PythonGen(),
    javascript: new JavaScriptGen(),
    java: new JavaGen()
};

const languageNames = {
    cpp: 'C++',
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java'
};

async function runTests() {
    console.log('🧪 Comprehensive Wrapper Generator Test Suite\n');
    console.log('═'.repeat(80));
    console.log('Testing all data structure types across all 4 languages:');
    console.log('  • Arrays (Two Sum)');
    console.log('  • Matrices (Spiral Matrix)');
    console.log('  • Trees (Level Order Traversal)');
    console.log('  • Linked Lists (Reverse List)');
    console.log('  • Graphs (Clone Graph)');
    console.log('  • Strings (Valid Parentheses)');
    console.log('  • Primitives (Palindrome Number)');
    console.log('═'.repeat(80));
    console.log('\n');

    let totalTests = 0;
    let passedTests = 0;

    // Test each question with each language
    for (const [questionKey, question] of Object.entries(testQuestions)) {
        console.log('\n' + '▓'.repeat(80));
        console.log(`▓  ${question.title.toUpperCase()}`);
        console.log('▓'.repeat(80));
        
        for (const [lang, gen] of Object.entries(generators)) {
            totalTests++;
            
            try {
                console.log(`\n┌─ ${languageNames[lang]} ─────────────────────────────────────────────────────────────────`);
                
                // Call generate method with await
                const template = await gen.generate(question);
                
                // Validate template structure
                const hasAllFields = template.headerCode && template.definition && 
                                    template.userFunction && template.mainFunction && 
                                    template.boilerplate;
                
                if (!hasAllFields) {
                    console.log(`❌ Missing required fields`);
                    continue;
                }
                
                // Validate data structures
                const hasListNode = template.definition.includes('ListNode');
                const hasTreeNode = template.definition.includes('TreeNode');
                
                if (!hasListNode || !hasTreeNode) {
                    console.log(`❌ Missing data structures (ListNode: ${hasListNode}, TreeNode: ${hasTreeNode})`);
                    continue;
                }
                
                // Display summary
                const headerLines = template.headerCode.split('\n').length;
                const defLines = template.definition.split('\n').length;
                const userLines = template.userFunction.split('\n').length;
                const mainLines = template.mainFunction.split('\n').length;
                
                console.log(`✅ Generation successful!`);
                console.log(`   Header:      ${headerLines} lines`);
                console.log(`   Definition:  ${defLines} lines (ListNode ✓, TreeNode ✓)`);
                console.log(`   User Func:   ${userLines} lines`);
                console.log(`   Main Func:   ${mainLines} lines`);
                
                // Show user function for verification
                console.log(`\n   User Function Preview:`);
                const userFuncLines = template.userFunction.split('\n').slice(0, 3);
                userFuncLines.forEach(line => console.log(`   ${line}`));
                
                passedTests++;
                
            } catch (error) {
                console.log(`❌ Generation failed: ${error.message}`);
            }
            
            console.log('└' + '─'.repeat(79));
        }
    }

    // Final summary
    console.log('\n\n' + '═'.repeat(80));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('═'.repeat(80));
    console.log(`Total Tests:     ${totalTests} (${Object.keys(testQuestions).length} questions × 4 languages)`);
    console.log(`Passed:          ${passedTests} ✅`);
    console.log(`Failed:          ${totalTests - passedTests} ❌`);
    console.log(`Success Rate:    ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('═'.repeat(80));

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! All data structures work across all languages.');
        process.exit(0);
    } else {
        console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Review the output above.`);
        process.exit(1);
    }
}

runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
