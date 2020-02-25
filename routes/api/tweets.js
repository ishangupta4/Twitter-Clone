const express = require("express");
const router = express.Router();
const Tweet = require("../../models/Tweet");

router.get("/test", (req, res) => res.json({ msg: "Tweet route work" }));

module.exports = router;
