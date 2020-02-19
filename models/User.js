const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
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
      type: String,
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  coverPic: {
      type: String
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  dateOfBirth: {
      type: Date
  },
  country: {
      type: String,
      requiredPaths: true
  },
  state: {
      type: String
  },
  followers: {
      type: Number,
      default: 0
  },
  followings: {
      type: Number,
      default: 0
  },
  noOfTweets: {
      type: Number,
      default: 0
  }
});

module.exports = User = mongoose.model('users', UserSchema);