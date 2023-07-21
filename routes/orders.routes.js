const router = require("express").Router()
const ordersController = require("../controllers/orders.controller")
const middleware = require("../middleware/jwt.middleware")

router.get("/orders/user/:userid", ordersController.getByUserId)
router.get("/orders/:id", middleware, ordersController.getById)
router.get("/orders/payment/:id", ordersController.getByPaymentId)
router.get("/orders", middleware, ordersController.getAll)
router.post("/orders", middleware, ordersController.create)
router.patch("/orders/:id", ordersController.update)
router.delete("/orders/:id", middleware, ordersController.deleteOrders)

module.exports = router
