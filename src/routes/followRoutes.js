const router = require("express").Router()
const { registerFollowUnfollow, getFollowMeta } = require("../controllers/followsController");
const { AuthMiddleware } = require("../middlewares")


router.post("/", AuthMiddleware.Authentication, registerFollowUnfollow);
router.get("/:id", getFollowMeta);

module.exports = router