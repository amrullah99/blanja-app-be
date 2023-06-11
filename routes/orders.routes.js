const router = require("express").Router()
const ordersController = require("../controllers/orders.controller")
const middleware = require("../middleware/jwt.middleware")

// router.get("/orders/user/:userid", ordersController.getByUserId)
router.get("/orders/:id", middleware, ordersController.getById)
router.get("/orders", middleware, ordersController.getAll)
// router.post("/orders", middleware, ordersController.create)
// router.patch("/orders/:id", middleware, ordersController.update)
// router.delete("/orders/:id", middleware, ordersController.deleteAddress)

module.exports = router
