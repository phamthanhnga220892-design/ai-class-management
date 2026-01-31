require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function testPortfolioAPI() {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');

    const client = await MongoClient.connect(uri);
    const db = client.db('ai-class-system');

    // Find Lan Linh
    const user = await db.collection('users').findOne({ fullName: 'Lan Linh' });
    if (!user) {
        console.log('User not found');
        await client.close();
        return;
    }

    const userId = user._id.toString();
    console.log('\n=== USER INFO ===');
    console.log('Name:', user.fullName);
    console.log('ID (string):', userId);
    console.log('ID (ObjectId):', user._id);

    // Test query with string
    console.log('\n=== TEST 1: Query with string ===');
    const products1 = await db.collection('products').find({ user: userId }).toArray();
    console.log('Results:', products1.length);

    // Test query with ObjectId
    console.log('\n=== TEST 2: Query with ObjectId ===');
    const products2 = await db.collection('products').find({ user: new ObjectId(userId) }).toArray();
    console.log('Results:', products2.length);

    // Check actual product data
    console.log('\n=== ALL PRODUCTS ===');
    const allProducts = await db.collection('products').find({}).toArray();
    allProducts.forEach(p => {
        console.log(`Product: ${p.title}`);
        console.log(`  user field type: ${typeof p.user}`);
        console.log(`  user field value: ${p.user}`);
        console.log(`  Match with string? ${p.user.toString() === userId}`);
        console.log(`  Match with ObjectId? ${p.user.equals(new ObjectId(userId))}`);
    });

    await client.close();
}

testPortfolioAPI().catch(console.error);
