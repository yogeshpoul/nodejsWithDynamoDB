const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config()

const app = express();
app.use(bodyParser.json());

// Configure DynamoDB Client for Local Development
const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000"
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

// Create table route
app.get("/create-table", async (req, res) => {
    const params = {
        TableName: "Users",
        KeySchema: [
            { AttributeName: "UserId", KeyType: "HASH" } // Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "UserId", AttributeType: "S" } // String type
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await client.send(new CreateTableCommand(params));
        console.log("Created table successfully.");
        res.send("Table created successfully!");
    } catch (err) {
        console.error("Unable to create table. Error:", err);
        res.status(500).send(err);
    }
});

// Add user route
app.post("/add-user", async (req, res) => {
    const { UserId, Name } = req.body;

    const params = {
        TableName: "Users",
        Item: {
            UserId: UserId,
            Name: Name
        }
    };

    try {
        await ddbDocClient.send(new PutCommand(params));
        console.log("Added user successfully.");
        res.send("User added successfully!");
    } catch (err) {
        console.error("Unable to add user. Error:", err);
        res.status(500).send(err);
    }
});

// Fetch user route
app.get("/users/:UserId", async (req, res) => {
    const { UserId } = req.params;

    const params = {
        TableName: "Users",
        Key: {
            UserId: UserId
        }
    };

    try {
        const data = await ddbDocClient.send(new GetCommand(params));
        console.log("Fetched user successfully:", data.Item);
        res.send(data.Item);
    } catch (err) {
        console.error("Unable to fetch user. Error:", err);
        res.status(500).send(err);
    }
});

app.get("/users", async (req, res) => {
    const params = {
        TableName: "Users"
    };

    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        console.log("Fetched all users successfully:", data.Items);
        res.send(data.Items);
    } catch (err) {
        console.error("Unable to fetch users. Error:", err);
        res.status(500).send(err);
    }
});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
