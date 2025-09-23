const express = require("express");
const authRouter = require("./auth.route");

const router = express.Router();

router.use("/v1/", authRouter);

module.exports = router;