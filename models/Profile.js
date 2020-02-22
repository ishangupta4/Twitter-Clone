const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String
    },
    username: {
        type: String,
    },
    bio: {
        type: String
    },
    dateOfJoining: {
        type: Date
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    avatar: {
        type: String
    },
    CoverPic: {
        type: String
    },
    noOfTweets: {
        type: Number,
    },
    followers: {
        type: Number
    },
    followings: {
        type: Number
    },
    tweets: [
        {
            tweet: {
                type: Schema.Types.ObjectId,
                ref: 'tweets'
            }
        }
    ]
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);