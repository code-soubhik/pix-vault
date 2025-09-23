const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const router = require("./src/routes/route");

const app = express();

const port = process.env.PORT || 4444;

app.use(express.json())
app.use(cors())

connectDB();

app.get("/health", (req, res) => {
    return res.json({
        status: "OK",
        message: `Server is running on port: ${port}`
    })
})

app.use(router);

app.listen(port, () =>{
    console.log(`Server is running on port: ${port}`)
})
