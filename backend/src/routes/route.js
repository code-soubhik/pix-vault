const express = require("express");
const authRouter = require("./auth.route");
const imageRouter = require("./image.route");
const { verifyToken } = require("../middleware/auth.middleware")
const router = express.Router();

router.use("/v1/auth", authRouter);
router.use("/v1/image", verifyToken, imageRouter);

module.exports = router;