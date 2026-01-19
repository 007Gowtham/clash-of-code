const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTemplate() {
    try {
        const question = await prisma.question.findFirst({
            where: { title: { contains: 'Reverse Linked List' } }
        });

        if (!question) {
            console.log('Question "Reverse Linked List" not found.');
            return;
        }

        const newMainFunction = `
// Helper functions
function parseArray(input) {
    if (!input || input.trim() === '[]') return [];
    // Remove brackets and split
    const inner = input.replace(/^\\[|\\]$/g, '').trim();
    if (!inner) return [];
    return inner.split(',').map(Number);
}

function buildList(arr) {
    let dummy = new ListNode(0);
    let curr = dummy;
    for (let val of arr) {
        curr.next = new ListNode(val);
        curr = curr.next;
    }
    return dummy.next;
}

function listToString(head) {
    const res = [];
    let curr = head;
    while (curr) {
        res.push(curr.val);
        curr = curr.next;
    }
    return JSON.stringify(res);
}

// Execution
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

const arr = JSON.parse(input); // Use JSON.parse for robust array parsing
const head = buildList(arr);

// {{USER_FUNCTION}} placeholder is NOT here, so TemplateBuilder appends user code before this.
// Wait, check TemplateBuilder logic. 
// If mainFunction does NOT include {{USER_FUNCTION}}, it appends userCode then mainFunction.
// But calling reverseList(head) requires reverseList to be defined.
// User code defines reverseList.
// So:
// 1. Definition (ListNode)
// 2. User Code (reverseList)
// 3. Main Function (Helpers + Call) -- This seems correct.

const ans = reverseList(head);
console.log(listToString(ans));
`;

        const updated = await prisma.questionTemplate.update({
            where: {
                questionId_language: {
                    questionId: question.id,
                    language: 'javascript'
                }
            },
            data: {
                mainFunction: newMainFunction
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
