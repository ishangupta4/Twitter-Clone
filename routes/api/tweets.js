const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const Tweet = require("../../models/Tweet");
const validateTweetsInput = require('../../validation/tweet');

router.get('/test', (req, res) => res.json({ msg: 'Tweet route work' }));

router.get("/:tweetId", (req, res, next) => {
    const id = req.params.tweetId;
    Tweet.findById(id)
        .exec()
        .then(tweet => {
            if (tweet) {
                res.status(200).json({
                    tweet: tweet,
                    request: {
                        type: "GET",
                        url: "http://localhost:5000/tweets"  //edit it fot current user tweets 
                    }
                });
            } else {
                res
                    .status(404)
                    .json({ message: "No tweet found for provided id" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

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
    User.findOne({username: newTweet.username}).then(user => {
        if(!user) {
            console.log('no user found');
            console.log(newTweet.user);
        }
        user.tweets.unshift({tweet: newTweet.id});
        user.save();
    }).catch(err => console.log(err));
});

router.get('/tweets', (req,res) => {
    Tweet.find().sort({ date: -1 })
        .then(tweets => res.json({tweets}))
            .catch(error => res.status(404).json({notweetsfound: 'no tweets found'}));
});

router.get('/tweet/:id', (req,res) => {
    Tweet.findById(req.params.id)
        .then(tweet => res.json(tweet))
            .catch(error => res.status(404).json({notweetfound: 'no Tweet found with given ID'}));
});

router.delete('/tweets/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    User.findById(req.user.id).then(user => {
        Tweet.findById(req.params.id)
            .then(tweet => {
                if(tweet.user.toString() !== req.user.id) {
                    return res.status(401).json({
                        notauthorized: 'user not authorized'
                    });
                }
                const removeIndex = user.tweets
                .map(item => item.tweet.toString())
                .indexOf(req.params.id);
               tweet.remove().then(() => res.json({success: true})); 
               user.tweets.splice(removeIndex, 1);
               user.save();
            })
            .catch(err => console.log(err));
    });
});

module.exports = router;
