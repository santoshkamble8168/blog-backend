const router = require("express").Router()
const { createUser, updateUser, deleteUser, getAllUsers, getUser } = require("../controllers/userController")

router.post("/", createUser)
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);

module.exports = router