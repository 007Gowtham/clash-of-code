
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Reseeding Test Cases with Enhanced Coverage...');

    const questions = await prisma.question.findMany();

    for (const q of questions) {
        console.log(`\nProcessing: ${q.title} (${q.id})`);

        // 1. Delete existing test cases
        await prisma.testCase.deleteMany({
            where: { questionId: q.id }
        });
        console.log('  - Cleared old test cases');

        let newTestCases = [];

        // 2. Define Test Cases based on Title
        if (q.title === 'Two Sum') {
            newTestCases = [
                // Samples (3-4)
                { isSample: true, input: "[2,7,11,15]\n9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
                { isSample: true, input: "[3,2,4]\n6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6." },
                { isSample: true, input: "[3,3]\n6", output: "[0,1]" },
                // Non-Samples (Hidden/Stress)
                { isSample: false, input: "[0,4,3,0]\n0", output: "[0,3]" },
                { isSample: false, input: "[-1,-2,-3,-4,-5]\n-8", output: "[2,4]" },
                { isSample: false, input: "[1,5,9]\n10", output: "[0,2]" }, // 1+9=10
                { isSample: false, input: "[2,5,5,11]\n10", output: "[1,2]" },
                { isSample: false, input: "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,50,51]\n101", output: "[15,16]" },
                { isSample: false, input: "[-10,-20,-30,-40,-50]\n-90", output: "[3,4]" },
            ];
        }
        else if (q.title === 'Reverse Linked List') {
            newTestCases = [
                { isSample: true, input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" },
                { isSample: true, input: "[1,2]", output: "[2,1]" },
                { isSample: true, input: "[]", output: "[]" },
                // Non-Samples
                { isSample: false, input: "[1]", output: "[1]" },
                { isSample: false, input: "[1,2,3]", output: "[3,2,1]" },
                { isSample: false, input: "[10,20,30,40]", output: "[40,30,20,10]" },
                { isSample: false, input: "[-1,-2,-3]", output: "[-3,-2,-1]" },
                { isSample: false, input: "[1,0,1]", output: "[1,0,1]" },
                { isSample: false, input: "[1,2,3,4,5,6,7,8,9,10]", output: "[10,9,8,7,6,5,4,3,2,1]" }
            ];
        }
        else if (q.title === 'Search a 2D Matrix') {
            newTestCases = [
                { isSample: true, input: "[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n3", output: "true" },
                { isSample: true, input: "[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n13", output: "false" },
                { isSample: true, input: "[[1]]\n1", output: "true" },
                // Non-Samples
                { isSample: false, input: "[[1]]\n0", output: "false" },
                { isSample: false, input: "[[1,3]]\n3", output: "true" },
                { isSample: false, input: "[[1,3]]\n1", output: "true" },
                { isSample: false, input: "[[1],[3]]\n3", output: "true" },
                { isSample: false, input: "[[1,3,5,7],[10,11,16,20],[23,30,34,50]]\n30", output: "true" },
                { isSample: false, input: "[[1,3,5,7],[10,11,16,20],[23,30,34,50]]\n35", output: "false" },
                { isSample: false, input: "[[1,3,5,7],[10,11,16,20],[23,30,34,60]]\n60", output: "true" }
            ];
        }
        else if (q.title === 'Valid Parentheses') {
            newTestCases = [
                { isSample: true, input: "\"()\"", output: "true" },
                { isSample: true, input: "\"()[]{}\"", output: "true" },
                { isSample: true, input: "\"(]\"", output: "false" },
                // Non-Samples
                { isSample: false, input: "\"([)]\"", output: "false" },
                { isSample: false, input: "\"{[]}\"", output: "true" },
                { isSample: false, input: "\"\"", output: "true" },
                { isSample: false, input: "\"[\"", output: "false" },
                { isSample: false, input: "\"]\"", output: "false" },
                { isSample: false, input: "\"(((((((())))))))\"", output: "true" },
                { isSample: false, input: "\"((()(())))\"", output: "true" },
                { isSample: false, input: "\"(((((((()))))))\"", output: "false" }
            ];
        }
        else if (q.title === 'Maximum Depth of Binary Tree') {
            newTestCases = [
                { isSample: true, input: "[3,9,20,null,null,15,7]", output: "3" },
                { isSample: true, input: "[1,null,2]", output: "2" },
                { isSample: true, input: "[]", output: "0" },
                // Non-Samples
                { isSample: false, input: "[0]", output: "1" },
                { isSample: false, input: "[1,2,3,4,null,null,5]", output: "3" },
                { isSample: false, input: "[1,2,3,4,5]", output: "3" },
                { isSample: false, input: "[1,2,3,4,5,6,7,8]", output: "4" },
                { isSample: false, input: "[1,null,2,null,3,null,4]", output: "4" }
            ];
        }
        else {
            console.log(`  - No test case mapping for title: ${q.title}`);
            continue;
        }

        // 3. Batch Insert
        const created = await Promise.all(newTestCases.map((tc, index) =>
            prisma.testCase.create({
                data: {
                    questionId: q.id,
                    input: tc.input,
                    output: tc.output,
                    explanation: tc.explanation,
                    isSample: tc.isSample,
                    isHidden: !tc.isSample,
                    order: index,
                    points: Math.floor(100 / newTestCases.length) // Distribute points roughly
                }
            })
        ));

        console.log(`  + Added ${created.length} test cases.`);
    }

    console.log('✅ Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
