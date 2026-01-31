// Quick script to delete old sessions and create new ones for a specific class
// Run with: npx ts-node src/fix-class-sessions.js

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/ai-class-management?w=majority';
const CLASS_ID = '696cf1ac595782e529d5ca27';

async function main() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db();
        const sessionsCollection = db.collection('sessions');

        // Delete all sessions for this class
        const deleteResult = await sessionsCollection.deleteMany({
            $or: [
                { class: CLASS_ID }, // String format (old)
                { class: new ObjectId(CLASS_ID) } // ObjectId format (new)
            ]
        });
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} old sessions`);

        // Create new sessions with correct ObjectId format
        const newSessions = [
            {
                class: new ObjectId(CLASS_ID),
                title: 'Bài 1: Giới thiệu về AI',
                content: '<h2>Chào mừng đến với khóa học AI!</h2><p>Trong bài học này, chúng ta sẽ tìm hiểu về khái niệm cơ bản của Trí tuệ nhân tạo (AI).</p>',
                videoUrl: 'https://www.youtube.com/watch?v=example1',
                orderIndex: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                class: new ObjectId(CLASS_ID),
                title: 'Bài 2: Ứng dụng AI trong đời sống',
                content: '<h2>AI xung quanh chúng ta</h2><p>Khám phá các ứng dụng thực tế của AI trong cuộc sống hàng ngày.</p>',
                videoUrl: 'https://www.youtube.com/watch?v=example2',
                orderIndex: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                class: new ObjectId(CLASS_ID),
                title: 'Bài 3: Thực hành đầu tiên',
                content: '<h2>Bắt tay vào làm!</h2><p>Cùng thực hành tạo dự án AI đầu tiên của bạn.</p>',
                videoUrl: 'https://www.youtube.com/watch?v=example3',
                orderIndex: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const insertResult = await sessionsCollection.insertMany(newSessions);
        console.log(`✅ Created ${insertResult.insertedCount} new sessions`);

        // Verify
        const count = await sessionsCollection.countDocuments({ class: new ObjectId(CLASS_ID) });
        console.log(`\n📊 Total sessions for class: ${count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n👋 Done!');
    }
}

main();
