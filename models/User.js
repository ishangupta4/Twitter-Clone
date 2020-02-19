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
  dateOfJoining: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('users', UserSchema);