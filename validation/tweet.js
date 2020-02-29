const Validator = require('validator');
const _ = require('lodash');

module.exports = function ValidateTweetsInput(data) {
    let errors = {};

    if(_.isEmpty(data.text)) {
        if(_.isEmpty(data.mediaLinks)) {
            errors.text = 'Tweet can not be empty';
        }
    }
    else {
        if(!Validator.isLength(data.text, {max: 280})) {
            errors.text = 'Tweet can not be more than 280 characters long';
        }
    }
    //remove this validation if photos/videos are stored locally
    if(!_.isEmpty(data.mediaLinks)) {
        if(!Validator.isURL(data.mediaLinks)) {
            errors.mediaLinks = 'Link of media provided is not valid';
        }
    }

    return {
        errors,
        isValid: _.isEmpty(errors)
    };
};