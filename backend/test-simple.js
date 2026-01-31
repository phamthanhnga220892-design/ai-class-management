require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function test() {
    try {
        const uri = process.env.MONGODB_URI;
        const client = await MongoClient.connect(uri);
        const db = client.db('ai-class-system');

        // Get user
        const user = await db.collection('users').findOne({ fullName: 'Lan Linh' });
        console.log('User ID:', user._id.toString());

        // Get all products to see structure
        const allProducts = await db.collection('products').find({}).toArray();
        console.log('\nAll products:');
        allProducts.forEach(p => {
            console.log('- Title:', p.title);
            console.log('  User field:', p.user);
            console.log('  User type:', p.user.constructor.name);
        });

        // Test with ObjectId
        const products = await db.collection('products').find({
            user: new ObjectId(user._id.toString())
        }).toArray();
        console.log('\nQuery result:', products.length, 'products');

        await client.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
