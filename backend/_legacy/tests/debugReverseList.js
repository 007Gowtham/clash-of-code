/**
 * Debug Reverse List Problem
 * Tests the exact code provided by the user
 */

const { PrismaClient } = require('@prisma/client');
const templateGenerationService = require('../src/services/wrapperGeneration/TemplateGenerationService');
const codeExecutionService = require('../src/services/codeExecutionService');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const userCppCode = `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr != nullptr) {
        ListNode* nextNode = curr->next; // store next
        curr->next = prev;              // reverse link
        prev = curr;                    // move prev
        curr = nextNode;                // move curr
    }

    return prev; // new head
}`;

async function debugReverseList() {
    try {
        console.log('🔍 Finding Reverse Linked List question...\n');

        // Find the reverse linked list question
        const question = await prisma.question.findFirst({
            where: {
                functionName: 'reverseList'
            },
            include: {
                testCases: {
                    where: { isSample: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!question) {
            console.log('❌ Reverse List question not found!');
            console.log('Please ensure the question exists in the database.');
            return;
        }

        console.log(`✅ Found question: ${question.title}`);
        console.log(`   Question ID: ${question.id}`);
        console.log(`   Sample test cases: ${question.testCases.length}\n`);

        // Test for each language
        const languages = ['cpp', 'python', 'javascript', 'java'];

        for (const language of languages) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`Testing ${language.toUpperCase()}`);
            console.log('='.repeat(80));

            try {
                // Get user code for this language
                let userCode;
                if (language === 'cpp') {
                    userCode = userCppCode;
                } else if (language === 'python') {
                    userCode = `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    prev = None
    curr = head
    
    while curr:
        next_node = curr.next  # store next
        curr.next = prev       # reverse link
        prev = curr            # move prev
        curr = next_node       # move curr
    
    return prev  # new head`;
                } else if (language === 'javascript') {
                    userCode = `function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr !== null) {
        const nextNode = curr.next; // store next
        curr.next = prev;           // reverse link
        prev = curr;                // move prev
        curr = nextNode;            // move curr
    }
    
    return prev; // new head
}`;
                } else if (language === 'java') {
                    userCode = `public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    
    while (curr != null) {
        ListNode nextNode = curr.next; // store next
        curr.next = prev;              // reverse link
        prev = curr;                   // move prev
        curr = nextNode;               // move curr
    }
    
    return prev; // new head
}`;
                }

                // Generate executable code
                console.log('\n📝 Generating executable code...');
                const executableCode = await templateGenerationService.generateExecutableCode(
                    question.id,
                    language,
                    userCode
                );

                // Save to file for inspection
                const outputDir = path.join(__dirname, '../debug_output');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                const filename = path.join(outputDir, `reverse_list_${language}.${language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'javascript' ? 'js' : 'cpp'}`);
                fs.writeFileSync(filename, executableCode);
                console.log(`✅ Saved executable code to: ${filename}`);

                // Show first 1000 characters
                console.log('\n📄 Generated code preview (first 1000 chars):');
                console.log('-'.repeat(80));
                console.log(executableCode.substring(0, 1000));
                console.log('-'.repeat(80));

                // Execute code
                console.log('\n🚀 Executing code...');
                const executionResult = await codeExecutionService.runTestCases(
                    executableCode,
                    language,
                    question.testCases
                );

                // Display results
                console.log('\n📊 Execution Results:');
                console.log(`   Verdict: ${executionResult.allPassed ? '✅ ACCEPTED' : '❌ WRONG ANSWER'}`);
                console.log(`   Tests Passed: ${executionResult.testsPassed}/${executionResult.totalTests}`);
                console.log(`   Execution Time: ${executionResult.totalExecutionTime}ms`);
                console.log(`   Memory: ${executionResult.maxMemory}KB`);

                // Show individual test case results
                console.log('\n📋 Test Case Details:');
                executionResult.results.forEach((result, index) => {
                    const status = result.passed ? '✅' : '❌';
                    console.log(`\n   ${status} Test Case ${index + 1}:`);
                    console.log(`      Input: ${result.input}`);
                    console.log(`      Expected: ${result.expectedOutput}`);
                    console.log(`      Actual: ${result.actualOutput}`);
                    if (result.error) {
                        console.log(`      Error: ${result.error}`);
                    }
                });

            } catch (error) {
                console.error(`\n❌ Error testing ${language}:`, error.message);
                if (error.stack) {
                    console.error(error.stack);
                }
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ Debug test complete!');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugReverseList();
