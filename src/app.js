const express = require("express")
const rootRouter = require("./routes")
const app = express()

/*--------------------------middlewares start--------------------------*/
app.use(express.json())
//routers
app.use(rootRouter);

module.exports = app

