const router = require("express").Router()
const { createComment, getAllComments, updateComment, deleteComment } = require("../controllers/commentController")
const { AuthMiddleware } = require("../middlewares")

router.post("/", AuthMiddleware.verifyToken, createComment);
router.put("/:postId", AuthMiddleware.verifyToken, updateComment);
router.delete("/:id", AuthMiddleware.verifyToken, deleteComment);
router.get("/:postId", AuthMiddleware.verifyToken, getAllComments);

module.exports = router