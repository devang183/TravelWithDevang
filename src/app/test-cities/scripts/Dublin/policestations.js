import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const db = client.db("hello");              // database name
    const collection = db.collection("collection1"); // collection name

    // Fetch document by ID
    const doc = await collection.findOne({ _id: new ObjectId("68a039975e44e978673dcde3") });
    console.log("Document:", doc);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);