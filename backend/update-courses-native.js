const { MongoClient, ObjectId } = require('mongodb');

async function updateCourses() {
    const uri = 'mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB Atlas');

        const db = client.db('ai-class-system');
        const courses = db.collection('courses');

        // Update course 1: Nhà Khám Phá Nhí
        const result1 = await courses.updateOne(
            { _id: new ObjectId('694f3860e3d05c30bf308e76') },
            {
                $set: {
                    title: 'Nhà Khám Phá Nhí',
                    description: 'Khóa học cơ bản về AI, lịch sử và ứng dụng dành cho các bạn nhỏ.'
                }
            }
        );
        console.log('✓ Updated "Nhà Khám Phá Nhí":', result1.modifiedCount, 'document(s)');

        // Update course 2: Nhà Kiến Tạo Nâng Cao
        const result2 = await courses.updateOne(
            { _id: new ObjectId('694f3860e3d05c30bf308e77') },
            {
                $set: {
                    title: 'Nhà Kiến Tạo Nâng Cao',
                    description: 'Học máy từ cơ bản đến nâng cao, xây dựng các dự án thực tế.'
                }
            }
        );
        console.log('✓ Updated "Nhà Kiến Tạo Nâng Cao":', result2.modifiedCount, 'document(s)');

        // Verify
        const allCourses = await courses.find({}).toArray();
        console.log('\n✓ All courses after update:');
        allCourses.forEach(c => {
            console.log(`  - ${c.title} (${c.totalSessions} buổi)`);
        });

        console.log('\n✅ Update completed successfully!');

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('✓ Database connection closed');
    }
}

updateCourses();
