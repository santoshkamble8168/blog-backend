const {ErrorHandler} = require("../utils")
const {config} = require("../config")

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"

    //handle mongodb errors
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    //handle mongodb duplicate key error
    if (err.code === 11000) {
        const message = `${Object.keys(err.keyValue)} alredy exists`
        err = new ErrorHandler(message, 409)
    }

    //handle invaid JWT token
    if (err.name === "JsonWebTokenError") {
        const message = "Invaid token, Please try again!"
        err = new ErrorHandler(message, 409)
    }

    //handle JWT expire
    if (err.name === "TokenExpireError") {
        const message = "Token Expired"
        err = new ErrorHandler(message, 401)
    }

    //if envrionment is dev show Error stack
    let stack = undefined;
    if (config.nodeENV === "dev") {
        stack = err.stack
    }

    res.status(err.statusCode).json({
      status: false,
      message: err.message,
      stack,
    });

}