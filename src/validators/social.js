const validator = require('validator');
const isEmpty = require('./is_empty');

function validateEducation(data) {
    var errorMessage = {};

    var fields = [
        {"fieldName" : "schoolName", "minLength" : 3, "maxLength" : 24},
        {"fieldName" : "degree", "minLength" : 3, "maxLength" : 24},
        {"fieldName" : "fieldOfStudy", "minLength" : 3, "maxLength" : 24},
        {"fieldName" : "from"},
        {"fieldName" : "current"},
        {"fieldName" : "description", "minLength" : 3, "maxLength" : 120},
    ]

    fields.forEach((field) => {
        const fieldName = field.fieldName
        const fieldMinLength = field.minLength
        const fieldMaxLength = field.maxLength
        data[fieldName] = !isEmpty(data[fieldName]) ? data[fieldName].trim() : '';
        if (validator.isEmpty(data[fieldName])) {
            errorMessage[fieldName] = fieldName+ ' field is required';
        }
        if (fieldMinLength) {
            if (!validator.isLength(data[fieldName], { min: fieldMinLength, max: fieldMaxLength })) {
                errorMessage[fieldName] = `${fieldName} length must be minimum ${fieldMinLength}, maximum ${fieldMaxLength}`;
            }
        }
    })

    return {
        error : errorMessage,
        valid : isEmpty(errorMessage)
    }
}

module.exports = validateEducation