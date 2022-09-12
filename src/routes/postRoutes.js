const router = require("express").Router()
const { createPost, updatePost, deletePost, getAllPosts, getSinglePost, likePost, bookmarkPost } = require("../controllers/postController")
const { AuthMiddleware } = require("../middlewares")

router.post("/", AuthMiddleware.Authentication, createPost);
router.put("/:id", AuthMiddleware.Authentication, updatePost);
router.delete("/:id", AuthMiddleware.Authentication, deletePost);

router.get("/", AuthMiddleware.publicAuthentication, getAllPosts);
router.get("/:id", getSinglePost)

router.put("/like/:id", AuthMiddleware.Authentication, likePost);
router.put("/bookmark/:id", AuthMiddleware.Authentication, bookmarkPost);

module.exports = router