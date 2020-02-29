const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const Tweet = require("../../models/Tweet");
const validateTweetsInput = require('../../validation/tweet');

router.get("/test", (req, res) => res.json({ msg: "Tweet route work" }));

router.post('/tweet', passport.authenticate('jwt', {session: false}), (req,res) => {
    const {errors, isValid} = validateTweetsInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const newTweet = new Tweet({
        text: req.body.text,
        mediaLinks: req.body.mediaLinks,
        mentions: req.body.mention,
        hashtags: req.body.hashtags,
        user: req.user.id,
        //next fields will be taken from user using redux, if you're using 
        //different technology you may remove them
        name: req.user.name,
        username: req.user.username,
        avatar: req.user.avatar 
    });

    newTweet.save().then(post => res.json(post));
    // User.findOne({user: req.user.id}).then(user => {
    //     user.userTweets.unshift({tweet: newTweet.id});
    //     user.save().then(user => res.json(user));
    // }).catch(err => console.log(err));
});

router.get('/tweets', (req,res) => {
    Tweet.find().sort({ date: -1 })
        .then(tweets => res.json({tweets}))
            .catch(error => res.status(404).json({notweetsfound: 'no tweets found'}));
});

module.exports = router;
