const routes = require("express").Router()
const { createCategory, updateCategory, deleteCategory, getAllCategory, getSingleCategory } = require("../controllers/categoryController");
const { AuthMiddleware } = require("../middlewares");

routes.post("/", AuthMiddleware.verifyToken, createCategory)
routes.put("/:id", AuthMiddleware.verifyToken, updateCategory);
routes.delete("/:id", AuthMiddleware.verifyToken, deleteCategory);

routes.get("/", getAllCategory);
routes.get("/:id", getSingleCategory);

module.exports = routes