const router = require("express").Router()
const { registerFollow } = require("../controllers/followsController")
const { AuthMiddleware } = require("../middlewares")


router.post("/", AuthMiddleware.Authentication, registerFollow)

module.exports = router