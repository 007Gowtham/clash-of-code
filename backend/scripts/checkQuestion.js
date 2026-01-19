const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuestion() {
    // Find the first Merge K Sorted Lists question
    const question = await prisma.question.findFirst({
        where: { title: 'Merge K Sorted Lists' }
    });

    console.log('📝 Question Data:\n');
    console.log('Title:', question.title);
    console.log('Function Name:', question.functionName);
    console.log('Function Signature:', question.functionSignature);
    console.log('Input Type:', question.inputType);
    console.log('Output Type:', question.outputType);

    // Parse the signature
    if (question.functionSignature) {
        const sig = JSON.parse(question.functionSignature);
        console.log('\n📋 Parsed Signature:');
        console.log('Return Type:', sig.returnType);
        console.log('Parameters:', sig.params);
    }

    await prisma.$disconnect();
}

checkQuestion();
