const { MongoClient, ObjectId } = require('mongodb');

async function updateCourseThumbnails() {
    const uri = 'mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✓ Connected to MongoDB Atlas');

        const db = client.db('ai-class-system');
        const courses = db.collection('courses');

        // Update Nhà Khám Phá Nhí
        const result1 = await courses.updateOne(
            { _id: new ObjectId('694f3860e3d05c30bf308e76') },
            {
                $set: {
                    thumbnail: '/nha-kham-pha-nhi.png'
                }
            }
        );
        console.log('✓ Updated "Nhà Khám Phá Nhí": /nha-kham-pha-nhi.png');

        // Update Nhà Kiến Tạo Nâng Cao
        const result2 = await courses.updateOne(
            { _id: new ObjectId('694f3860e3d05c30bf308e77') },
            {
                $set: {
                    thumbnail: '/nha-kien-tao-nang-cao.png'
                }
            }
        );
        console.log('✓ Updated "Nhà Kiến Tạo Nâng Cao": /nha-kien-tao-nang-cao.png');

        // Verify
        const allCourses = await courses.find({}).toArray();
        console.log('\n✓ Courses updated:');
        allCourses.forEach(c => {
            console.log(`  - ${c.title}: ${c.thumbnail}`);
        });

        console.log('\n✅ Done!');

    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

updateCourseThumbnails();
