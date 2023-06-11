const router = require("express").Router()
const productsController = require("../controllers/products.controller")
const middleware = require("../middleware/jwt.middleware")

router.get("/products/:id", productsController.getById)
router.get("/products", productsController.getAll)
router.get("/products/category/:category", productsController.getByCategory)
router.post("/products", productsController.create)
router.patch("/products/:id", middleware, productsController.update)
// router.patch("/products/photo", middleware, productsController.updatePhoto)
router.delete("/products/:id", middleware, productsController.deleteProducts)

module.exports = router
