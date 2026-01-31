const { MongoClient, ObjectId } = require('mongodb');

async function updateCourseDuration() {
    const uri = 'mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB Atlas');

        const db = client.db('ai-class-system');
        const courses = db.collection('courses');

        // Update both courses to 1200 minutes
        const result = await courses.updateMany(
            {},
            {
                $set: {
                    totalDuration: 1200
                }
            }
        );
        console.log('✓ Updated totalDuration for all courses:', result.modifiedCount, 'document(s)');

        // Verify
        const allCourses = await courses.find({}).toArray();
        console.log('\n✓ All courses:');
        allCourses.forEach(c => {
            console.log(`  - ${c.title}: ${c.totalSessions} buổi, ${c.totalDuration} phút`);
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

updateCourseDuration();
