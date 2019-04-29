const joi = require('joi')

module.exports = {
    body: {
        name: joi.string().required().min(6),
        email: joi.string().email().required(),
        password: joi.string().required()
    }
}