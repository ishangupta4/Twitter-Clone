const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');

router.get('/test', (req,res) => res.json({msg: 'profile route work'}));

module.exports = router;