const router = require("express").Router()
const { createUser } = require("../controllers/userController")

router.post("/", createUser)

module.exports = router