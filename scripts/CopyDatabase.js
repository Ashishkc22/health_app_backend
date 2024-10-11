const { MongoClient } = require("mongodb");

async function copyDatabase(sourceUri, sourceDbName, targetUri, targetDbName) {
  // Create a new MongoClient
  const sourceClient = new MongoClient(sourceUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const targetClient = new MongoClient(targetUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to source and target databases
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(sourceDbName);
    const targetDb = targetClient.db(targetDbName);

    // Get list of collections from the source database
    const collections = await sourceDb.listCollections().toArray();

    for (const collection of collections) {
      const sourceCollection = sourceDb.collection(collection.name);
      const targetCollection = targetDb.collection(collection.name);

      // Get all documents from the source collection
      const documents = await sourceCollection.find().toArray();

      // Insert documents into the target collection
      if (documents.length > 0) {
        await targetCollection.insertMany(documents);
        console.log(
          `Copied ${documents.length} documents from collection ${collection.name}`
        );
      }
    }

    console.log("Database copy completed successfully!");
  } catch (error) {
    console.error("Error copying database:", error);
  } finally {
    // Close the connections
    await sourceClient.close();
    await targetClient.close();
  }
}

// Example usage
const sourceUri =
  "mongodb+srv://aarogyam7r:XGPbiYAWIqHvzsQl@arogyam-clustor.jqc6cqy.mongodb.net/?retryWrites=true&w=majority";
const sourceDbName = "test";
const targetUri =
  "mongodb+srv://Ashish224:AshishKc225@ticketsys.b27zde6.mongodb.net/yourDatabaseName?retryWrites=true&w=majority&appName=TicketSys";
const targetDbName = "health-upwork-dev";

copyDatabase(sourceUri, sourceDbName, targetUri, targetDbName);
