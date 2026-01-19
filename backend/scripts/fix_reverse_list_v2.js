const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTemplate() {
    try {
        console.log('Connecting to database...');

        // Find question by title if ID is uncertain, but user provided ID: 42bd4598-8750-4c08-9961-74894f0b6b4b
        // Let's verify if that ID exists, otherwise fall back to title search.
        let question = await prisma.question.findUnique({
            where: { id: '42bd4598-8750-4c08-9961-74894f0b6b4b' }
        });

        if (!question) {
            console.log('Question with ID 42bd4598... not found. Searching by title...');
            question = await prisma.question.findFirst({
                where: { title: { contains: 'Reverse Linked List' } }
            });
        }

        if (!question) {
            console.error('Question "Reverse Linked List" not found in database.');
            return;
        }

        console.log(`Updating Template for Question: ${question.title} (ID: ${question.id})`);

        const mainFunction = `// Helper function to parse array from string
function parseArray(str) {
    try {
        return JSON.parse(str);
    } catch(e) {
        return [];
    }
}

// Helper function to build linked list from array
function buildList(arr) {
    if (!arr || arr.length === 0) return null;
    
    const dummy = new ListNode(0);
    let current = dummy;
    
    for (let i = 0; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    
    return dummy.next;
}

// Helper function to convert linked list to array string
function listToString(head) {
    const result = [];
    let current = head;
    
    while (current !== null) {
        result.push(current.val);
        current = current.next;
    }
    
    return JSON.stringify(result);
}

// Main execution
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();

const arr = parseArray(input);
const head = buildList(arr);
const ans = reverseList(head);
const output = listToString(ans);

console.log(output);`;

        // Update the template
        const updated = await prisma.questionTemplate.update({
            where: {
                questionId_language: {
                    questionId: question.id,
                    language: 'javascript'
                }
            },
            data: {
                mainFunction: mainFunction
            }
        });

        console.log('Template updated successfully!');

    } catch (error) {
        console.error('Error updating template:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateTemplate();
