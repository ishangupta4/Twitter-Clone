const express = require("express");
const router = express.Router();
const Tweet = require("../../models/Tweet");

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

module.exports = router;
