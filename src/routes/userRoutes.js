const router = require("express").Router()
const { 
  createUser, 
  updateUser, 
  deleteUser, 
  getAllUsers, 
  getUser, 
  updateUserPassword, 
  getUserLikes, 
  getUserBookmarks, 
  getProfile, 
  followUser 
} = require("../controllers/userController");
const { AuthMiddleware } = require("../middlewares");

router.post("/", createUser)

router.put("/:id", AuthMiddleware.Authentication, updateUser);
router.put(
  "/update-password/:id",
  AuthMiddleware.Authentication,
  updateUserPassword
);
router.delete("/:id", AuthMiddleware.Authentication, deleteUser);
router.get("/", AuthMiddleware.Authentication, getAllUsers);
router.get("/:id", AuthMiddleware.Authentication, getUser);
router.get("/profile/me", AuthMiddleware.Authentication, getProfile);
router.get("/actions/likes", AuthMiddleware.Authentication, getUserLikes);
router.get(
  "/actions/bookmarks",
  AuthMiddleware.Authentication,
  getUserBookmarks
);

router.put("/follow/:id", AuthMiddleware.Authentication, followUser);

module.exports = router