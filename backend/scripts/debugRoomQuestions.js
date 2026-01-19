const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const roomId = '239b3acd-4a16-4ed2-bb89-e30b64e7aef8';

async function debugRoom() {
    console.log(`🔎 Debugging Room: ${roomId}`);

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            questions: true
        }
    });

    if (!room) {
        console.log('❌ Room not found! (Checking partial ID match...)');
        // Retrieve via first matching ID segment if full ID is not found (unlikely for UUID)
        return;
    }

    console.log(`✅ Room found: ${room.name}`);
    console.log(`📚 Questions in room: ${room.questions.length}`);

    for (const q of room.questions) {
        if (q.title.includes('Reverse')) { // Focus on the problematic one
            console.log(`\n📌 Question: "${q.title}" (${q.id})`);
            console.log(`   Slug: ${q.slug}`);
            console.log(`   Func Sig: ${q.functionSignature ? 'YES' : 'NO'}`);

            // Check template
            const template = await prisma.questionTemplate.findUnique({
                where: {
                    questionId_language: {
                        questionId: q.id,
                        language: 'python'
                    }
                }
            });

            console.log(`   Template (Python): ${template ? '✅ FOUND' : '❌ MISSING'}`);
            if (template) {
                console.log(`   Starter Code: ${template.starterCode.substring(0, 50)}...`);
            }
        }
    }

    await prisma.$disconnect();
}

debugRoom();
