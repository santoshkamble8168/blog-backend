const router = require("express").Router()

router.use("/auth", require("./authRoutes"))
router.use("/user", require("./userRoutes"))
router.use("/post", require("./postRoutes"))
router.use("/category", require("./categoryRoutes"))
router.use("/comment", require("./commentRoutes"))
router.use("/tags", require("./tagRoutes"))
router.use("/follows", require("./followRoutes"));

module.exports = router