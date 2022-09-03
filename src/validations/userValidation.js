const Joi = require("joi")

exports.createUser = (req) => {
    const createUserSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    })

    return createUserSchema.validate(req.body, {abortEarly: false})
}

exports.userLogin = (req) => {
    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    })

    return loginSchema.validate(req.body, {abortEarly: false})
}