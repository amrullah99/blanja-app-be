const orderModel = require("../models/payment.models")
const userModel = require("../models/users.models")
const db = require("../database")
const midtransClient = require("midtrans-client")

const create = async (req, res) => {
  // Create Snap API instance
  let snap = new midtransClient.Snap({
    // Set to true if you want Production Environment (accept real transaction).
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  })

  let parameter = req.body

  snap.createTransaction(parameter).then(async (transaction) => {
    // transaction token
    let transactionToken = transaction.token
    const payload = {}
    await orderModel.create()
    res.json({
      status: true,
      message: "Create Payment Success",
      token: transactionToken,
    })
  })
}

module.exports = {
  create,
}
