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

// "product_id",
// "user_id",
// "quantity",
// "paymentmethod",
// "address_id",
// "total",
const create = async (req, res) => {
  try {
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
  create,
}
