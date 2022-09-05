const routes = require("express").Router()
const { createCategory, updateCategory, deleteCategory, getAllCategory, getSingleCategory } = require("../controllers/categoryController");

routes.post("/", createCategory)
routes.put("/:id", updateCategory);
routes.delete("/:id", deleteCategory);
routes.get("/", getAllCategory);
routes.get("/:id", getSingleCategory);

module.exports = routes