require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")

const usersRoutes = require("./routes/users.routes")
const authRoutes = require("./routes/auth.routes")
const productsRoutes = require("./routes/products.routes")
const addressRoutes = require("./routes/address.routes")
const ordersRoutes = require("./routes/orders.routes")
const paymentRoutes = require("./routes/payment.routes")
const invalidRoutes = require("./routes/404.routes")

const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const fileUpload = require("express-fileupload")

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(helmet())
app.use(xss())
app.use(cors())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
)

app.use(usersRoutes)
app.use(authRoutes)
app.use(productsRoutes)
app.use(addressRoutes)
app.use(ordersRoutes)
app.use(paymentRoutes)

// Home
app.get("/", (req, res) => {
  res.send("API For Blanja App")
})

// Other routes
app.use(invalidRoutes)

app.listen(8000, () => {
  console.log("App running in port 8000")
})
