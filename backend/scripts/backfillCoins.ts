import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore
}

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.MONGODB_DB_NAME || "shajsutro";

async function backfill() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log("Connected to MongoDB successfully!");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("No database instance");
  }

  const usersCollection = db.collection("users");
  const ordersCollection = db.collection("orders");

  const users = await usersCollection.find({}).toArray();
  const orders = await ordersCollection.find({}).toArray();

  console.log(`Found ${users.length} users and ${orders.length} orders.`);

  let totalCoinsCredited = 0;

  for (const user of users) {
    const userOrders = orders.filter(
      (o) =>
        o.user &&
        o.user.toString() === user._id.toString() &&
        !["cancelled", "returned"].includes(o.status)
    );

    let calculatedCoins = 0;

    for (const order of userOrders) {
      // 1 coin per 100 BDT spent
      const earned = Math.floor((order.total || 0) / 100);
      calculatedCoins += earned;

      // Update order if coinsEarned is not set
      if (order.coinsEarned === undefined || order.coinsEarned === 0) {
        await ordersCollection.updateOne(
          { _id: order._id },
          { $set: { coinsEarned: earned, coinsUsed: order.coinsUsed || 0, coinDiscount: order.coinDiscount || 0 } }
        );
      }
    }

    // Subtract any used coins
    const usedCoinsTotal = userOrders.reduce((sum, o) => sum + (o.coinsUsed || 0), 0);
    const finalCoins = Math.max(0, calculatedCoins - usedCoinsTotal);

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { coins: finalCoins } }
    );

    console.log(`✓ User ${user.name || user.email}: Total Orders = ${userOrders.length}, Coins credited = ${finalCoins}`);
    totalCoinsCredited += finalCoins;
  }

  console.log(`\n🎉 Successfully backfilled coins! Total coins credited across all users: ${totalCoinsCredited}`);
  await mongoose.disconnect();
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Error backfilling coins:", err);
  process.exit(1);
});
