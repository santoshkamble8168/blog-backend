const router = require("express").Router()
const { createPost, updatePost, deletePost, getAllPosts, getSinglePost } = require("../controllers/postController")
const { AuthMiddleware } = require("../middlewares")


router.post("/", AuthMiddleware.verifyToken , createPost)
router.put("/:id", AuthMiddleware.verifyToken, updatePost);
router.delete("/:id", AuthMiddleware.verifyToken, deletePost);
router.get("/", getAllPosts)
router.get("/:id", getSinglePost)

module.exports = router