const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateQuestions() {
    console.log('🔄 Updating questions individually...\n');

    try {
        // Get all Merge K Sorted Lists questions
        const mergeKQuestions = await prisma.question.findMany({
            where: { title: 'Merge K Sorted Lists' }
        });

        console.log(`Found ${mergeKQuestions.length} Merge K Sorted Lists questions`);

        // Update each one with a unique slug
        for (let i = 0; i < mergeKQuestions.length; i++) {
            const q = mergeKQuestions[i];
            const slug = i === 0 ? 'merge-k-sorted-lists' : `merge-k-sorted-lists-${i}`;

            await prisma.question.update({
                where: { id: q.id },
                data: {
                    slug,
                    functionName: 'mergeKLists',
                    functionSignature: JSON.stringify({
                        returnType: 'ListNode*',
                        params: [
                            { type: 'vector<ListNode*>&', name: 'lists' }
                        ]
                    }),
                    inputType: JSON.stringify(['array_of_linked_lists']),
                    outputType: 'linked_list'
                }
            });
            console.log(`✅ Updated: ${q.title} (${slug})`);
        }

        // Update Two Sum questions
        const twoSumQuestions = await prisma.question.findMany({
            where: { title: 'Two Sum' }
        });

        for (let i = 0; i < twoSumQuestions.length; i++) {
            const q = twoSumQuestions[i];
            const slug = i === 0 ? 'two-sum' : `two-sum-${i}`;

            await prisma.question.update({
                where: { id: q.id },
                data: {
                    slug,
                    functionName: 'twoSum',
                    functionSignature: JSON.stringify({
                        returnType: 'vector<int>',
                        params: [
                            { type: 'vector<int>&', name: 'nums' },
                            { type: 'int', name: 'target' }
                        ]
                    }),
                    inputType: JSON.stringify(['array', 'int']),
                    outputType: 'array'
                }
            });
            console.log(`✅ Updated: ${q.title} (${slug})`);
        }

        console.log('\n✅ All questions updated!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

updateQuestions();
