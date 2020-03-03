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
    type: String,
    default: 'default avatar path here'
  },
  coverPic: {
    type: String,
    default: 'default cover path here'
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  dateOfBirth: {
    type: Date
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
    type: String,
    default: ''
  },
  location: {
    type: String
  }
});

module.exports = User = mongoose.model("users", UserSchema);
