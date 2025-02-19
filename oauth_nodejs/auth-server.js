const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "sap123ok";
const users = { 
    testUser: { password: "password123", id: 1 } 
};

// Endpoint to get an access token
app.post("/oauth/token", (req, res) => {
    const { username, password } = req.body;

    if (!users[username] || users[username].password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ user: username, id: users[username].id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ access_token: token, token_type: "Bearer", expires_in: 3600 });
});

// Endpoint to verify the token (for WebSocket server)
app.post("/oauth/verify", (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: error.message });
    }
});

app.listen(4000, () => console.log("OAuth2 server running on http://localhost:4000"));
