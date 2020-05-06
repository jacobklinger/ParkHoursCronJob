const AWS = require("aws-sdk");

const dynamoService = {};
const table = "ParkHours";

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com",
});

const client = new AWS.DynamoDB.DocumentClient();

dynamoService.insert = async function (date, ParkHours) {
    var params = {
        TableName: table,
        Item: {
            "Date": date,
            "ParkHours": ParkHours
        }
    };

    client.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports = dynamoService;