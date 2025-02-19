const WebSocket = require("ws");
const axios = require("axios");

async function getAccessToken(username, password) {
    try {
        const response = await axios.post("http://192.168.0.170:4000/oauth/token", { username, password });
        return response.data.access_token;
    } catch (error) {
        // console.error("Failed to get access token:", error.response?.data || error.message);
        console.error("Failed to get access token:", error.response && error.response.data ? error.response.data : error.message);

        return null;
    }
}

async function connectWebSocket() {
    const token = await getAccessToken("testUser", "password123");

    if (!token) {
        console.error("Authentication failed. Exiting...");
        return;
    }

    const ws = new WebSocket("ws://192.168.0.170:8003");

    ws.on("open", () => {
        console.log("Connected to WebSocket server");

        const requestData = {
            requestId: "12345",
            message: "Hello Server",
            token: token // Send OAuth2 token
        };

        ws.send(JSON.stringify(requestData));
    });

    ws.on("message", (data) => {
        console.log("Received callback response:", data);
    });

    ws.on("close", () => {
        console.log("Disconnected from server");
    });
}

connectWebSocket();
