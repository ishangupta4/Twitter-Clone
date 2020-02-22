const validator = require('validator');
var _ = require('lodash');

module.exports = function validateRegisterInput(data) {
    
    let errors = {};
    
    if(_.isEmpty(data.name)) {
        errors.name = 'name feild can not be empty';
    }
    if(!_.isEmpty(data.name)) {
        if(!validator.isLength(data.name, {min: 3, max: 40})) {
            errors.name = 'name must be between 3 and 40 characters long';
        }
    }
    if(_.isEmpty(data.username)) {
        errors.username = 'username feild can not be empty';
    }
    if(!_.isEmpty(data.email)) {
        if(!validator.isEmail(data.email)) {
            errors.email = 'email is not valid';
        }
    }
    if(_.isEmpty(data.email)) {
        errors.email = 'email feild can not be empty';
    }
    if(_.isEmpty(data.password)) {
        errors.password = 'password feild can not be empty';
    }
    if(_.isEmpty(data.confirmPassword)) {
        errors.confirmPassword = 'confirm password can not be empty';
    }

    data.password = !_.isEmpty(data.password) ? data.password : '';
    data.confirmPassword = !_.isEmpty(data.confirmPassword) ? data.confirmPassword : '';
    if(!validator.equals(data.password,data.confirmPassword)) {
        errors.confirmPassword = 'passwords did not match';
    }

    return {
        errors,
        isValid: _.isEmpty(errors)
    };
};