const router = require("express").Router();
const { createCategory, updateCategory, deleteCategory, getAllCategory, getSingleCategory, followCategory } = require("../controllers/categoryController");
const { AuthMiddleware } = require("../middlewares");

router.post("/", AuthMiddleware.Authentication, createCategory);
router.put("/:id", AuthMiddleware.Authentication, updateCategory);
router.delete("/:id", AuthMiddleware.Authentication, deleteCategory);

router.get("/", getAllCategory);
router.get("/:id", getSingleCategory);

router.put("/follow/:id", AuthMiddleware.Authentication, followCategory);

module.exports = router;