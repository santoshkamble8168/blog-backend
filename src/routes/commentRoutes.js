const router = require("express").Router()
const { createComment, getAllComments, updateComment, deleteComment } = require("../controllers/commentController")
const { AuthMiddleware } = require("../middlewares")

router.post("/", AuthMiddleware.Authentication, createComment);
router.put("/:postId", AuthMiddleware.Authentication, updateComment);
router.delete("/:id", AuthMiddleware.Authentication, deleteComment);

router.get("/:postId", getAllComments);

module.exports = router