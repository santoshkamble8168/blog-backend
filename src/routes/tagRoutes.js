const router = require("express").Router()
const { createTag, getAllTags, deleteTag } = require("../controllers/tagsController");
const { AuthMiddleware } = require("../middlewares");

router.post("/", AuthMiddleware.verifyToken, createTag);
router.delete("/:id", AuthMiddleware.verifyToken, deleteTag);
router.get("/", getAllTags);

module.exports = router