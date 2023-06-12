const model = require("../models/orders.models")
const db = require("../database")
const jwt = require("jsonwebtoken")

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  )
  return token
}

const getAll = async (req, res) => {
  try {
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { id }) => {
        let query
        let sort = db`DESC`
        const isPaginate =
          req?.query?.page &&
          !isNaN(req?.query?.page) &&
          parseInt(req?.query?.page) >= 1
        if (req?.query?.sortType?.toLowerCase() === "asc") {
          if (isPaginate) {
            sort = db`ASC LIMIT 10 OFFSET ${
              10 * (parseInt(req?.query?.page) - 1)
            }`
          } else {
            sort = db`ASC LIMIT 10`
          }
        } else {
          if (isPaginate) {
            sort = db`DESC LIMIT 10 OFFSET ${
              10 * (parseInt(req?.query?.page) - 1)
            }`
          } else {
            sort = db`DESC LIMIT 10`
          }
        }
        query = await model.getAll(sort, id)
        res.json({
          status: !!query?.length,
          message: query?.length ? "Get data success" : "Data not found",
          total: query?.length ?? 0,
          pages: isPaginate
            ? {
                current: parseInt(req?.query?.page),
                total: query?.[0]?.full_count
                  ? Math.ceil(parseInt(query?.[0]?.full_count) / 10)
                  : 0,
              }
            : null,
          data: query?.map((item) => {
            delete item.full_count
            return item
          }),
        })
      }
    )
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

const getById = async (req, res) => {
  try {
    jwt.verify(getToken(req), process.env.JWT_PRIVATE_KEY, async (err) => {
      const {
        params: { id },
      } = req
      if (isNaN(id)) {
        res.status(400).json({
          status: false,
          message: "ID must be integer",
        })
        return
      }
      const query = await model.getById(id)
      if (!query?.length) {
        res.status(400).json({
          status: false,
          message: `ID ${id} not found!`,
        })
      }
      res.json({
        status: true,
        message: "Get success",
        data: query,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

const getByUserId = async (req, res) => {
  try {
    const {
      params: { userid },
    } = req
    let query
    let sort = db`DESC`
    const isPaginate =
      req?.query?.page &&
      !isNaN(req?.query?.page) &&
      parseInt(req?.query?.page) >= 1
    if (req?.query?.sortType?.toLowerCase() === "asc") {
      if (isPaginate) {
        sort = db`ASC LIMIT 10 OFFSET ${10 * (parseInt(req?.query?.page) - 1)}`
      } else {
        sort = db`ASC LIMIT 10`
      }
    } else {
      if (isPaginate) {
        sort = db`DESC LIMIT 10 OFFSET ${10 * (parseInt(req?.query?.page) - 1)}`
      } else {
        sort = db`DESC LIMIT 10`
      }
    }
    query = await model.getByUserId(userid, sort)
    if (!query?.length) {
      res.status(400).json({
        status: false,
        message: `ID ${userid} not found!`,
      })
    }
    res.json({
      status: true,
      message: "Get success",
      data: query,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

const create = async (req, res) => {
  try {
    jwt.verify(getToken(req), process.env.JWT_PRIVATE_KEY, async (err) => {
      const {
        product_id,
        user_id,
        quantity,
        paymentmethod,
        address_id,
        total,
      } = req.body
      if (
        !(
          product_id &&
          user_id &&
          quantity &&
          paymentmethod &&
          address_id &&
          total
        )
      ) {
        res.status(400).json({
          status: false,
          message: "Bad input, please complete all of fields",
        })
        return
      }
      if (isNaN(product_id)) {
        res.status(400).send({
          status: false,
          message: "Product ID is Not a Number",
        })
      }
      if (isNaN(user_id)) {
        res.status(400).send({
          status: false,
          message: "User ID is Not a Number",
        })
      }
      if (isNaN(quantity)) {
        res.status(400).send({
          status: false,
          message: "Quantity is Not a Number",
        })
      }
      if (isNaN(address_id)) {
        res.status(400).send({
          status: false,
          message: "Address ID is Not a Number",
        })
      }
      if (isNaN(total)) {
        res.status(400).send({
          status: false,
          message: "Total is Not a Number",
        })
      }
      const dateObject = new Date()
      const date = `0${dateObject.getDate()}`.slice(-2)
      const month = `0${dateObject.getMonth() + 1}`.slice(-2)
      const year = dateObject.getFullYear()
      // const hourssave = `0${dateObject.getHours() + 7}`.slice(-2)
      const hours = `0${dateObject.getHours()}`.slice(-2)
      const minutes = `0${dateObject.getMinutes()}`.slice(-2)
      const seconds = `0${dateObject.getSeconds()}`.slice(-2)
      const createdat = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
      const payload = {
        product_id,
        user_id,
        quantity,
        paymentmethod,
        address_id,
        total,
        createdat,
      }
      await model.create(payload)
      res.status(200).send({
        status: true,
        message: "Success insert data",
        data: payload,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

const update = async (req, res) => {
  try {
    jwt.verify(getToken(req), process.env.JWT_PRIVATE_KEY, async (err) => {
      const {
        params: { id },
      } = req
      const {
        body: {
          product_id,
          user_id,
          quantity,
          paymentmethod,
          address_id,
          total,
        },
      } = req
      let checkData = await model.getById(id)
      if (!checkData?.length) {
        res.json({
          status: false,
          message: `ID ${id} not found!`,
        })
      }
      const payload = {
        product_id: product_id ?? checkData[0].product_id,
        user_id: user_id ?? checkData[0].user_id,
        quantity: quantity ?? checkData[0].quantity,
        paymentmethod: paymentmethod ?? checkData[0].paymentmethod,
        address_id: address_id ?? checkData[0].address_id,
        total: total ?? checkData[0].total,
        createdat: checkData[0].createdat,
      }
      if (isNaN(payload.product_id)) {
        res.status(400).send({
          status: false,
          message: "Product ID is Not a Number",
        })
      }
      if (isNaN(payload.user_id)) {
        res.status(400).send({
          status: false,
          message: "User ID is Not a Number",
        })
      }
      if (isNaN(payload.quantity)) {
        res.status(400).send({
          status: false,
          message: "Quantity is Not a Number",
        })
      }
      if (isNaN(payload.address_id)) {
        res.status(400).send({
          status: false,
          message: "Address ID is Not a Number",
        })
      }
      if (isNaN(payload.total)) {
        res.status(400).send({
          status: false,
          message: "Total is Not a Number",
        })
      }
      const query = await model.update(payload, id)
      res.send({
        status: true,
        message: "Success edit data",
        data: query,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

const deleteOrders = async (req, res) => {
  try {
    jwt.verify(getToken(req), process.env.JWT_PRIVATE_KEY, async (err) => {
      const id = req.params.id
      const checkData = await model.getById(id)
      if (!checkData?.length) {
        res.status(404).json({
          status: false,
          message: `ID ${id} not found`,
        })
        return
      }
      const query = await model.deleteOrders(id)
      res.send({
        status: true,
        message: "Success delete data",
        data: query,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

module.exports = {
  getAll,
  getById,
  getByUserId,
  create,
  update,
  deleteOrders,
}
