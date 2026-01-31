const { MongoClient, ObjectId } = require('mongodb');

async function updateCourseSessions() {
    const uri = 'mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB Atlas');

        const db = client.db('ai-class-system');
        const courses = db.collection('courses');

        // Update "Nhà Kiến Tạo Nâng Cao" to have 10 sessions
        const result = await courses.updateOne(
            { _id: new ObjectId('694f3860e3d05c30bf308e77') },
            {
                $set: {
                    totalSessions: 10
                }
            }
        );
        console.log('✓ Updated totalSessions for "Nhà Kiến Tạo Nâng Cao":', result.modifiedCount, 'document(s)');

        // Verify
        const allCourses = await courses.find({}).toArray();
        console.log('\n✓ All courses:');
        allCourses.forEach(c => {
            console.log(`  - ${c.title}: ${c.totalSessions} buổi`);
        });

        console.log('\n✅ Update completed!');

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('✓ Database connection closed');
    }
}

updateCourseSessions();
