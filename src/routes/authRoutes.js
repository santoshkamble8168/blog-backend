const { login, emailVerification, logout, forgotPassword, resetPassword } = require("../controllers/authController")

const router = require("express").Router()

router.get("/verify/:token", emailVerification);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router