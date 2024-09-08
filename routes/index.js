const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoute");
const userRoute = require("./userRoute");

router.use("/auth", authRoutes);
router.use("/users", userRoute);

module.exports = router;
