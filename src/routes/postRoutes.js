const router = require("express").Router()
const { createPost, updatePost, deletePost, getAllPosts, getSinglePost, likePost, bookmarkPost } = require("../controllers/postController")
const { AuthMiddleware } = require("../middlewares")

router.post("/", AuthMiddleware.verifyToken , createPost)
router.put("/:id", AuthMiddleware.verifyToken, updatePost);
router.delete("/:id", AuthMiddleware.verifyToken, deletePost);

router.get("/", getAllPosts)
router.get("/:id", getSinglePost)

router.put("/like/:id", AuthMiddleware.verifyToken, likePost);
router.put("/bookmark/:id", AuthMiddleware.verifyToken, bookmarkPost);

module.exports = router