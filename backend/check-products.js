require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function checkProducts() {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');

    const client = await MongoClient.connect(uri);
    const db = client.db('ai-class-system');

    // Check all products
    const products = await db.collection('products').find({}).toArray();
    console.log('\n=== ALL PRODUCTS ===');
    console.log('Total products:', products.length);
    products.forEach(p => {
        console.log(`- ${p.title} (User: ${p.user})`);
    });

    // Find Lan Linh
    const user = await db.collection('users').findOne({ fullName: 'Lan Linh' });
    if (user) {
        console.log('\n=== LAN LINH INFO ===');
        console.log('User ID:', user._id.toString());

        // Check Lan Linh's products
        const userProducts = await db.collection('products').find({ user: user._id }).toArray();
        console.log('Lan Linh products:', userProducts.length);
        userProducts.forEach(p => {
            console.log(`- ${p.title}: ${p.description}`);
        });
    } else {
        console.log('\nUser "Lan Linh" not found');
    }

    await client.close();
}

checkProducts().catch(console.error);
