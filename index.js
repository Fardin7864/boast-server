const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://fardin18:hamba78@cluster0.7k1zdza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors({
  origin: "*", // Replace with your allowed origin
  methods: ['GET', 'POST'], // Specify allowed HTTP methods
}));
app.use(express.json());

// MongoDB Client Configuration
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Main function
async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Collections
    const usersCollection = client.db('Boast').collection('users');
    const waitListCollection = client.db('Boast').collection('waitlist');

    // Create beta user
    app.post("/api/v1/add-waitlist", async (req, res) => {
      try {
        const betaUser = req.body;
        console.log(betaUser);
        const existUser = await waitListCollection.findOne({ email: betaUser.email });
        if (existUser) {
          return res.status(400).send({ message: 'This email is already registered' });
        }

        const result = await waitListCollection.insertOne(betaUser);
        return res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Failed to add user" });
      }
    });

    // Get beta users
    app.get("/api/v1/waitlist", async (req, res) => {
      try {
        const result = await waitListCollection.find().toArray();
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });

  } finally {
    // Close MongoDB connection
    // await client.close();
  }
}

// Start the server
run().catch(console.error);

// Default route
app.get("/", (req, res) => {
  res.send({ message: "Server is running!" });
});

// Start listening
app.listen(port, () => {
  console.log("Server is running on port:", port);
});
