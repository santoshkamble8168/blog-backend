const express = require("express")
const rootRouter = require("./routes")
const {ErrorMiddleWare} = require("./middlewares")
const app = express()

/*--------------------------middlewares start--------------------------*/
app.use(express.json())
//routers
app.use(rootRouter);

//handle all errors
app.use(ErrorMiddleWare);

module.exports = app

