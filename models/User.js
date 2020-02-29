const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  coverPic: {
    type: String,
    default: "url for cover pic" //add the url of default cover picture
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  dateOfBirth: {
    type: Date
  },
  noOfFollowers: {
    type: Number,
    default: 0
  },
  noOfFollowings: {
    type: Number,
    default: 0
  },
  followers: [
    {
      follower: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  followings: [
    {
      following: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      } 
    }
  ],
  noOfTweets: {
    type: Number,
    default: 0
  },
  tweets: [
    {
      tweet: {
      type: Schema.Types.ObjectId,
      ref: 'tweets'
      }
    }
  ],
  retweets: [
    {
      tweet: {
      type: Schema.Types.ObjectId,
      ref: 'tweets'
      }
    }
  ],
  likes: [
    {
      tweet: {
        type: Schema.Types.ObjectId,
        ref: 'tweets'
      }
    }
  ],
  bio: {
    type: String
  },
  location: {
    type: String
  }
});

module.exports = User = mongoose.model("users", UserSchema);
