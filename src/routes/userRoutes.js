const router = require("express").Router()
const { createUser, updateUser, deleteUser, getAllUsers, getUser, updateUserPassword } = require("../controllers/userController")

router.post("/", createUser)
router.put("/:id", updateUser);
router.put("/update-password/:id", updateUserPassword)
router.delete("/:id", deleteUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);

module.exports = router