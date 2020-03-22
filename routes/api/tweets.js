const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require('../../models/User');
const Tweet = require("../../models/Tweet");
const validateTweetsInput = require('../../validation/tweet');
const checker = require('../../methods/tweet_methods');

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5}, fileFilter: fileFilter }); //limit set to 1 mb


router.get('/test', (req, res) => {
    res.json({ msg: 'Tweet route work' })
});

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

router.post('/tweet', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateTweetsInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    var { hashtags, mentions } = checker(req.body.text);
    const newTweet = new Tweet({
        text: req.body.text,
        mediaLinks: req.body.mediaLinks,
        mentions: mentions,
        hashtags: hashtags,
        user: req.user.id,
        //next fields will be taken from user using redux, if you're using 
        //different technology you may remove them
        name: req.user.name,
        username: req.user.username,
        avatar: req.user.avatar
    });

    newTweet.save().then(post => res.json(post));
    User.findOne({ username: newTweet.username }).then(user => {
        if (!user) {
            console.log('no user found');
            console.log(newTweet.user);
        }
        user.tweets.unshift({ tweet: newTweet.id });
        user.save();
    }).catch(err => console.log(err));
});

router.get('/', (req, res) => {
    Tweet.find().sort({ date: -1 })
        .then(tweets => {
            const response = {
                count: tweets.length,
                tweets: tweets
            };
            res.json({ response })
        })
        .catch(error => res.status(404).json({ notweetsfound: 'no tweets found' }));
});

router.get('/tweet/:id', (req, res) => {
    Tweet.findById(req.params.id)
        .then(tweet => res.json(tweet))
        .catch(error => res.status(404).json({ notweetfound: 'no Tweet found with given ID' }));
});

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.user.id).then(user => {
        Tweet.findById(req.params.id)
            .then(tweet => {
                if (tweet.user.toString() !== req.user.id) {
                    return res.status(401).json({
                        notauthorized: 'user not authorized'
                    });
                }
                const removeIndex = user.tweets
                    .map(item => item.tweet.toString())
                    .indexOf(req.params.id);
                tweet.remove().then(() => res.json({ success: true }));
                user.tweets.splice(removeIndex, 1);
                user.save();
            })
            .catch(err => console.log(err));
    });
});

router.post('/like/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        User.findById(req.user.id).then(user => {
            Tweet.findById(req.params.id)
                .then(tweet => {
                    if (
                        tweet.likes.filter(like => like.user.toString() === req.user.id)
                            .length > 0
                    ) {
                        return res
                            .status(400)
                            .json({ alreadyliked: 'User already liked this tweet' });
                    }

                    tweet.likes.unshift({ user: req.user.id });
                    user.likes.unshift({ tweet: req.params.id });
                    user.save();
                    tweet.save().then(tweet => res.json(tweet));
                })
                .catch(err => res.status(404).json({ tweetnotfound: 'No tweet found' }));
        });
    }
);

router.post('/unlike/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        User.findById(req.user.id).then(user => {
            Tweet.findById(req.params.id)
                .then(tweet => {
                    if (
                        tweet.likes.filter(like => like.user.toString() === req.user.id)
                            .length === 0
                    ) {
                        return res.status(400)
                            .json({ notliked: 'You have not yet liked this post' });
                    }

                    const removeIndex = tweet.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    tweet.likes.splice(removeIndex, 1);

                    const removeTweetIndex = user.likes
                        .map(item => item.tweet.toString())
                        .indexOf(req.params.id);

                    user.likes.splice(removeTweetIndex, 1);
                    user.save();
                    tweet.save().then(tweet => res.json(tweet));
                })
                .catch(err => res.status(404).json({ tweetnotfound: 'No tweet found' }));
        });
    }
);

router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.user.id).then(user => {
        Tweet.findById(req.params.id)
            .then(tweet => {
                const { errors, isValid } = validateTweetsInput(req.body);
                if (!isValid) {
                    return res.status(400).json(errors);
                }

                const newTweet = new Tweet({
                    text: req.body.text,
                    mediaLinks: req.body.mediaLinks,
                    mentions: req.body.mention,
                    hashtags: req.body.hashtags,
                    user: req.user.id,
                    name: req.user.name,
                    username: req.user.username,
                    avatar: req.user.avatar
                });

                newTweet.replyingTo.unshift({
                    username: req.user.username,
                    tweetID: tweet.id
                });
                newTweet.save().then(newtweet => res.json(newtweet));
                user.tweets.unshift({ tweet: newTweet.id });
                user.save();
                tweet.comments.unshift({ tweet: newTweet.id });
                tweet.save();
            })
    });
});

router.post('/retweet/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.user.id).then(user => {
        Tweet.findById(req.params.id)
            .then(tweet => {
                if (
                    tweet.retweets.filter(retweet => retweet.user.toString() === req.user.id)
                        .length > 0
                ) {
                    return res
                        .status(400)
                        .json({ alreadyretweeted: 'User already retweeted this tweet' });
                }
                tweet.retweets.unshift({ user: req.user.id });
                tweet.save().then(tweet => res.json(tweet));

                user.retweets.unshift({ tweet: req.params.id });
                user.save();
            })
            .catch(err => res.status(404).json({ tweetnotfound: 'No tweet found' }));
    });
});

router.post('/revert/retweet/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        User.findById(req.user.id).then(user => {
            Tweet.findById(req.params.id)
                .then(tweet => {
                    if (
                        tweet.retweets.filter(retweet => retweet.user.toString() === req.user.id)
                            .length === 0
                    ) {
                        return res.status(400)
                            .json({ notretweeted: 'User has not retweeted this post' });
                    }

                    const removeIndex = tweet.retweets
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    tweet.retweets.splice(removeIndex, 1);

                    const removeTweetIndex = user.likes
                        .map(item => item.tweet.toString())
                        .indexOf(req.params.id);

                    user.retweets.splice(removeTweetIndex, 1);
                    user.save();
                    tweet.save().then(tweet => res.json(tweet));
                })
                .catch(err => res.status(404).json({ tweetnotfound: 'No tweet found' }));
        });
    }
);

router.patch("/media/:tweetId", upload.single('mediaLinks'), (req, res, next) => {
  const id = req.params.tweetId;
  const updateOps = {
    mediaLinks: req.file.path
  };
  Tweet.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Media uploaded",
        request: {
          type: "GET",
          url: "http://localhost:5000/api/tweets/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/rtcomment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById(req.user.id).then(user => {
        Tweet.findById(req.params.id)
            .then(tweet => {
                if (
                    tweet.retweets.filter(retweet => retweet.user.toString() === req.user.id)
                        .length > 0
                ) {
                    return res
                        .status(400)
                        .json({ alreadyretweeted: 'User already retweeted this tweet' });
                }

                const { errors, isValid } = validateTweetsInput(req.body);
                if (!isValid) {
                    return res.status(400).json(errors);
                }

                const newTweet = new Tweet({
                    text: req.body.text,
                    mediaLinks: req.body.mediaLinks,
                    mentions: req.body.mention,
                    hashtags: req.body.hashtags,
                    user: req.user.id,
                    name: req.user.name,
                    username: req.user.username,
                    avatar: req.user.avatar,
                    retweetedWithComment: req.params.id
                });
                newTweet.save().then(newtweet => res.json(newtweet));
                user.tweets.unshift({ tweet: newTweet.id });
                user.save();
                tweet.retweets.unshift({ user: req.user.id });
                tweet.save();
            })
    });
});

module.exports = router;
