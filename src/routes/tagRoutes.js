const router = require("express").Router()
const { createTag, getAllTags, deleteTag, followTag } = require("../controllers/tagsController");
const { AuthMiddleware } = require("../middlewares");

router.post("/", AuthMiddleware.Authentication, createTag);
router.delete("/:id", AuthMiddleware.Authentication, deleteTag);
router.get("/", getAllTags);

module.exports = router