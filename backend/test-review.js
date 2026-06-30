const mongoose = require('mongoose');

async function test() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log("Connected. Finding reviews...");
    
    const reviews = await mongoose.connection.collection('reviews').find({}).sort({createdAt: -1}).limit(2).toArray();
    console.log("Latest reviews:", JSON.stringify(reviews, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
