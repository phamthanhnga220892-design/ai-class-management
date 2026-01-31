// Script to update course names
// Run with: node update-courses.js

const mongoose = require('mongoose');

async function updateCourses() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/ai-class-management');
        console.log('Connected to MongoDB');

        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }), 'courses');

        // Update "Nhập môn Trí tuệ Nhân tạo" to "Nhà Khám Phá Nhí"
        const result1 = await Course.updateOne(
            { _id: mongoose.Types.ObjectId('694f3860e3d05c30bf308e76') },
            {
                $set: {
                    title: 'Nhà Khám Phá Nhí',
                    description: 'Khóa học cơ bản về AI, lịch sử và ứng dụng dành cho các bạn nhỏ.'
                }
            }
        );
        console.log('Updated course 1:', result1.modifiedCount, 'document(s)');

        // Update "Machine Learning A-Z" to "Nhà Kiến Tạo Nâng Cao"
        const result2 = await Course.updateOne(
            { _id: mongoose.Types.ObjectId('694f3860e3d05c30bf308e77') },
            {
                $set: {
                    title: 'Nhà Kiến Tạo Nâng Cao',
                    description: 'Học máy từ cơ bản đến nâng cao, xây dựng các dự án thực tế.'
                }
            }
        );
        console.log('Updated course 2:', result2.modifiedCount, 'document(s)');

        // Verify updates
        const courses = await Course.find({});
        console.log('\nAll courses:');
        courses.forEach(c => {
            console.log(`- ${c.title} (${c.totalSessions} buổi)`);
        });

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateCourses();
