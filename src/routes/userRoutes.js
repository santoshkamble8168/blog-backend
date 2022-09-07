const router = require("express").Router()
const { createUser, updateUser, deleteUser, getAllUsers, getUser, updateUserPassword, getUserLikes, getUserBookmarks } = require("../controllers/userController");
const { AuthMiddleware } = require("../middlewares");

router.post("/", createUser)
router.put("/:id", updateUser);
router.put("/update-password/:id", updateUserPassword)
router.delete("/:id", deleteUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.get("/actions/likes", AuthMiddleware.verifyToken, getUserLikes);
router.get("/actions/bookmarks", AuthMiddleware.verifyToken, getUserBookmarks);

module.exports = router