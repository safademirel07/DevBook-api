const Validator = require('validator');
const isEmpty = require('./is_empty');

function validateRegistration(data) {
    var errorMessage = {};

    data.name = !isEmpty(data.name) ? data.name.trim() : '';
    data.email = !isEmpty(data.email) ? data.email.trim() : '';
    data.password = !isEmpty(data.password) ? data.password.trim() : '';
    data.password2 = !isEmpty(data.password2) ? data.password2.trim() : '';

    if (Validator.isEmpty(data.name)) {
        errorMessage.name = 'Name field is required';
    }
    
    if (Validator.isEmpty(data.email)) {
        errorMessage.email = 'Email field is required';
    }

    if (Validator.isEmpty(data.password)) {
        errorMessage.password = 'Password field is required';
    }

    if (Validator.isEmpty(data.password2)) {
        errorMessage.password2 = 'Re-Password field is required';
    } 

    if (!Validator.isLength(data.name, { min: 3, max: 16 })) {
        errorMessage.name = 'Name must be minimum 3, maximum 12';
    }

    if (!Validator.isLength(data.password, { min: 6, max: 24 })) {
        errorMessage.password = 'Password must be minimum 6, maximum 24';
    }

    if (!Validator.equals(data.password, data.password2)) {
        errorMessage.password2 = 'Passwords are not matching';
    }

    if (!Validator.isEmail(data.email)) {
        errorMessage.email = "An email address required";
    }

    return {
        error : errorMessage,
        valid : isEmpty(errorMessage)
    };
}

module.exports = validateRegistration