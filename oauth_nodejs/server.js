const WebSocket = require("ws");
const axios = require("axios");

const wss = new WebSocket.Server({ port: 8003 });

console.log("WebSocket server running on ws://localhost:8003");

wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (message) => {
        console.log(`Received: ${message}`);

        let requestData;
        try {
            requestData = JSON.parse(message);
        } catch (error) {
            ws.send(JSON.stringify({ error: "Invalid JSON format" }));
            return;
        }

        const token = requestData.token;

        if (!token) {
            ws.send(JSON.stringify({ error: "Authentication required" }));
            return;
        }

        try {
            // Verify token with OAuth2 server
            const response = await axios.post("http://localhost:4000/oauth/verify", { token });

            if (!response.data.valid) {
                throw new Error("Invalid token");
            }

            console.log("Token verified:", response.data.user);

            const responseData = {
                requestId: requestData.requestId || null,
                status: "success",
                user: response.data.user.user, // Extracted username from token
                data: `Processed: ${requestData.message}`
            };

            ws.send(JSON.stringify(responseData));
        } catch (error) {
            ws.send(JSON.stringify({ error: "Unauthorized", details: error.message }));
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});