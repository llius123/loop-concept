import express from "express";
import fs from 'node:fs';
import cors from "cors";
const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {

    let data;
    try {
        data = fs.readFileSync('response.json', 'utf8');
    } catch (err) {
        console.error(err);
    }
    res.json(JSON.parse(data));
});

app.listen(port, () => {
    console.log(`Sandbox listening on port ${port}`);
});
