const { DynamoDBClient, CreateTableCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Configure DynamoDB Client for Local Development
const client = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000"
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

// Create table route for `store_chat`
app.get("/create-chat-table", async (req, res) => {
    const params = {
        TableName: "store_chat",
        KeySchema: [
            { AttributeName: "chat_id", KeyType: "HASH" },  // Partition key
            { AttributeName: "user_id", KeyType: "RANGE" }  // Sort key (if you want to define it as sort key)
        ],
        AttributeDefinitions: [
            { AttributeName: "chat_id", AttributeType: "S" }, // String type
            { AttributeName: "user_id", AttributeType: "S" }  // String type
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await client.send(new CreateTableCommand(params));
        console.log("Created `store_chat` table successfully.");
        res.send("`store_chat` table created successfully!");
    } catch (err) {
        console.error("Unable to create table. Error:", err);
        res.status(500).send(err);
    }
});

// Add chat message route
app.post("/add-chat", async (req, res) => {
    const { chat_id, user_id, timestamp, message, bot_response, s3key } = req.body;

    const params = {
        TableName: "store_chat",
        Item: {
            chat_id,
            user_id,
            timestamp,
            message,
            bot_response,
            s3key
        }
    };

    try {
        await ddbDocClient.send(new PutCommand(params));
        console.log("Added chat message successfully.");
        res.send("Chat message added successfully!");
    } catch (err) {
        console.error("Unable to add chat message. Error:", err);
        res.status(500).send(err);
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});