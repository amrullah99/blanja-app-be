const router = require("express").Router()
const paymentController = require("../controllers/payment.controller")
const middleware = require("../middleware/jwt.middleware")

// router.get("/orders/user/:userid", ordersController.getByUserId)
// router.get("/orders/:id", middleware, ordersController.getById)
// router.get("/orders", middleware, ordersController.getAll)
// router.patch("/orders/:id", middleware, ordersController.update)
// router.delete("/orders/:id", middleware, ordersController.deleteOrders)

router.post("/payment", middleware, paymentController.create)

module.exports = router
