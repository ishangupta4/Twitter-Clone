const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TweetSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  username: {
    type: String
  },
  text: {
    type: String
  },
  mediaLinks: {
    type: String
  },
  retweetedWithComment: {
    type: Boolean,
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "tweets"
    }
  },
  mentions: [
    {
      username: {
        type: String
      }
    }
  ],
  hashtags: [
    {
      type: String
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  retweets: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  replyingTo: [
    {
      username: {
        type: String
      }
    }
  ],
  comments: [
    {
      tweet: {
        type: Schema.Types.ObjectId,
        ref: "tweets"
      }
    }
  ]
});

module.exports = Tweet = mongoose.model("tweets", TweetSchema);
