const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
const root = __dirname;

app.use(cors());
app.use(express.json());
app.use(express.static(root));

app.get("/health", (_req, res) => {
    res.json({ ok: true, app: "MY AIR demo" });
});

app.post("/api/create-checkout-session", (_req, res) => {
    res.status(501).json({
        error: "Stripe test checkout endpoint is a placeholder.",
        legalNotice: "Connect Stripe only in test mode and only after legal compliance is verified."
    });
});

app.get("*", (_req, res) => {
    res.sendFile(path.join(root, "index.html"));
});

app.listen(port, () => {
    console.log(`MY AIR demo running on http://localhost:${port}`);
});
