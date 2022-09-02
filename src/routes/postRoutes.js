const router = require("express").Router()
const { createPost } = require("../controllers/postController")

//create post
router.post("/", createPost)

module.exports = router