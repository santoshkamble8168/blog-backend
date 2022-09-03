const express = require("express")
const cookieParser = require("cookie-parser")
const rootRouter = require("./routes")
const {ErrorMiddleWare} = require("./middlewares")
const app = express()

/*--------------------------middlewares start--------------------------*/
app.use(express.json())
app.use(cookieParser());
//routers
app.use(rootRouter);

//handle all errors
app.use(ErrorMiddleWare);

module.exports = app

