const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const Tweet = require("../../models/Tweet");
const validateTweetsInput = require('../../validation/tweet');

router.get("/test", (req, res) => res.json({ msg: "Tweet route work" }));


module.exports = router;
