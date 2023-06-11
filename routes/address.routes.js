const router = require("express").Router()
const addressController = require("../controllers/address.controller")
const middleware = require("../middleware/jwt.middleware")

router.get("/address/user/:userid", addressController.getByUserId)
router.get("/address/:id", addressController.getById)
router.get("/address", addressController.getAll)
router.post("/address", middleware, addressController.create)
router.patch("/address/:id", middleware, addressController.update)
router.delete("/address/:id", middleware, addressController.deleteAddress)

module.exports = router
