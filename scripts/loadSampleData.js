const { MongoClient, ObjectId } = require("mongodb");
const moment = require("moment");

// MongoDB connection URL
const url =
  "mongodb+srv://Ashish224:AshishKc225@ticketsys.b27zde6.mongodb.net/upwork?retryWrites=true&w=majority&appName=TicketSys";
const dbName = "yourDatabaseName"; // Replace with your database name

async function bulkInsertUsers() {
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // console.log("db.getName();", db.getName());

    // Generate random users data
    // const users = [];
    // for (let i = 1; i <= 10; i++) {
    //   const createdAt = moment()
    //     .subtract(Math.floor(Math.random() * 5 * 30), "days")
    //     .valueOf(); // Random date in the last 5 months

    //   users.push({
    //     _id: new ObjectId(),
    //     phone: `999999999${i}`,
    //     password: `password${i}`,
    //     device_id: `DEVICE${i}`,
    //     name: `User${i}`,
    //     email: `user${i}@example.com`,
    //     uid: `FE0000${i}`,
    //     role: "USER",
    //     status: ["Verified", "Unverified", "Suspended"][
    //       Math.floor(Math.random() * 3)
    //     ],
    //     score: Math.floor(Math.random() * 100),
    //     p2_count: Math.floor(Math.random() * 50),
    //     p_count: Math.floor(Math.random() * 10),
    //     d_count: Math.floor(Math.random() * 10),
    //     ud_count: Math.floor(Math.random() * 10),
    //     dis_count: Math.floor(Math.random() * 10),
    //     __v: 0,
    //     current_district: "District" + i,
    //     current_gram_panchayat: "Panchayat" + i,
    //     current_janpad: "Janpad" + i,
    //     current_location_type: "Village",
    //     current_maplink: "",
    //     current_pincode: `46200${i}`,
    //     current_state: "State" + i,
    //     current_tehsil: "Tehsil" + i,
    //     last_fetch: Date.now(),
    //     tl_id: `TL0000${i}`,
    //     address: "",
    //     district: "District" + i,
    //     emergency_contact: "",
    //     id_proof: {
    //       type: "Aadhar",
    //       front: null,
    //       back: null,
    //     },
    //     image: "",
    //     state: "State" + i,
    //     team_leader_id: `TL0000${i}`,
    //     created_at: createdAt,
    //   });
    // }

    // Bulk insert users into the collection
    const result = await usersCollection.insertMany([
      {
        _id: "ObjectId('642e768afd03cdac9ed07f77')",
        phone: "9999999999",
        password: "123123@7489",
        device_id: "ADMIN",
        name: "John Doe",
        email: "john.doe@example.com",
        uid: "FE00001",
        role: "USER",
        status: "Verified",
        score: Math.floor(Math.random() * 100),
        p2_count: Math.floor(Math.random() * 50),
        p_count: Math.floor(Math.random() * 10),
        d_count: Math.floor(Math.random() * 10),
        ud_count: Math.floor(Math.random() * 10),
        dis_count: Math.floor(Math.random() * 10),
        __v: 0,
        current_district: "Mumbai",
        current_gram_panchayat: "Andheri",
        current_janpad: "Mumbai South",
        current_location_type: "Urban",
        current_maplink: "",
        current_pincode: "400001",
        current_state: "MH",
        current_tehsil: "Andheri",
        last_fetch: Date.now(),
        tl_id: "TL00001",
        address: "123, Example Street",
        district: "Mumbai",
        emergency_contact: "+91-9999999999",
        id_proof: {
          type: "Aadhar",
          front: null,
          back: null,
        },
        image: "https://example.com/image.jpg",
        state: "MH",
        team_leader_id: "TL00001",
        created_at: Date.now(), // today's date
      },
      {
        _id: "ObjectId('642e768afd03cdac9ed07f78')",
        phone: "8888888888",
        password: "password123",
        device_id: "USER",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        uid: "FE00002",
        role: "USER",
        status: "Verified",
        score: Math.floor(Math.random() * 100),
        p2_count: Math.floor(Math.random() * 50),
        p_count: Math.floor(Math.random() * 10),
        d_count: Math.floor(Math.random() * 10),
        ud_count: Math.floor(Math.random() * 10),
        dis_count: Math.floor(Math.random() * 10),
        __v: 0,
        current_district: "Pune",
        current_gram_panchayat: "Kothrud",
        current_janpad: "Pune North",
        current_location_type: "Urban",
        current_maplink: "",
        current_pincode: "411038",
        current_state: "MH",
        current_tehsil: "Kothrud",
        last_fetch: Date.now() - 86400000, // yesterday's date
        tl_id: "TL00002",
        address: "456, Sample Avenue",
        district: "Pune",
        emergency_contact: "+91-8888888888",
        id_proof: {
          type: "Aadhar",
          front: null,
          back: null,
        },
        image: "https://example.com/image2.jpg",
        state: "MH",
        team_leader_id: "TL00002",
        created_at: Date.now() - 86400000, // yesterday's date
      },
    ]);
    console.log(`${result.insertedCount} users inserted`);
  } finally {
    await client.close();
  }
}

// async function bulkInsertUsers() {
//   const client = new MongoClient(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const usersCollection = db.collection("cards");

//     // Generate random users data
//     const users = [];
//     for (let i = 1; i <= 10; i++) {
//       const createdAt = moment()
//         .subtract(Math.floor(Math.random() * 5 * 30), "days")
//         .valueOf(); // Random date in the last 5 months

//       users.push({
//         _id: new ObjectId(),
//         phone: `999999999${i}`,
//         password: `password${i}`,
//         device_id: `DEVICE${i}`,
//         name: `User${i}`,
//         email: `user${i}@example.com`,
//         uid: `FE0000${i}`,
//         role: "USER",
//         status: ["Verified", "Unverified", "Suspended"][
//           Math.floor(Math.random() * 3)
//         ],
//         score: Math.floor(Math.random() * 100),
//         p2_count: Math.floor(Math.random() * 50),
//         p_count: Math.floor(Math.random() * 10),
//         d_count: Math.floor(Math.random() * 10),
//         ud_count: Math.floor(Math.random() * 10),
//         dis_count: Math.floor(Math.random() * 10),
//         __v: 0,
//         current_district: "District" + i,
//         current_gram_panchayat: "Panchayat" + i,
//         current_janpad: "Janpad" + i,
//         current_location_type: "Village",
//         current_maplink: "",
//         current_pincode: `46200${i}`,
//         current_state: "State" + i,
//         current_tehsil: "Tehsil" + i,
//         last_fetch: Date.now(),
//         tl_id: `TL0000${i}`,
//         address: "",
//         district: "District" + i,
//         emergency_contact: "",
//         id_proof: {
//           type: "Aadhar",
//           front: null,
//           back: null,
//         },
//         image: "",
//         state: "State" + i,
//         team_leader_id: `TL0000${i}`,
//         created_at: createdAt,
//       });
//     }

//     // Bulk insert users into the collection
//     const result = await usersCollection.insertMany(users);
//     console.log(`${result.insertedCount} users inserted`);
//   } finally {
//     await client.close();
//   }
// }

bulkInsertUsers().catch(console.error);
