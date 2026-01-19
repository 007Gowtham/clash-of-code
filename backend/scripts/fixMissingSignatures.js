const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log('🔧 Fixing Missing Signatures...');

    // 1. Two Sum
    const twoSumSig = JSON.stringify({
        returnType: "vector<int>",
        params: [
            { type: "vector<int>", name: "nums" },
            { type: "int", name: "target" }
        ]
    });

    // Note: inputType usually a string. "array" or "integer" etc.
    // For Two Sum, standard input is arrays.

    const twoSumUpdate = await prisma.question.updateMany({
        where: {
            title: "Two Sum",
            functionName: null
        },
        data: {
            functionName: "twoSum",
            functionSignature: twoSumSig,
            inputType: "array",
            outputType: "array"
        }
    });
    console.log(`Updated Two Sum: ${twoSumUpdate.count}`);

    // 2. Merge K Sorted Lists
    const mergeKSig = JSON.stringify({
        returnType: "ListNode*",
        params: [
            { type: "vector<ListNode*>", name: "lists" }
        ]
    });

    const mergeKUpdate = await prisma.question.updateMany({
        where: {
            title: "Merge K Sorted Lists",
            functionName: null
        },
        data: {
            functionName: "mergeKLists",
            functionSignature: mergeKSig,
            inputType: "linked_list",
            outputType: "linked_list"
        }
    });
    console.log(`Updated Merge K Sorted Lists: ${mergeKUpdate.count}`);
}

fix()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
