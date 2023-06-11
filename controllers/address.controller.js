const model = require("../models/address.models")
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
    query = await model.getAll(sort)
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
    if (isNaN(userid)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      })
      return
    }
    const query = await model.getByUserId(userid)
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
        addressas,
        recipientsname,
        recipientsphonenumber,
        address,
        postalcode,
        city,
        user_id,
      } = req.body
      if (
        !(
          addressas &&
          recipientsname &&
          recipientsphonenumber &&
          address &&
          postalcode &&
          city &&
          user_id
        )
      ) {
        res.status(400).json({
          status: false,
          message: "Bad input, please complete all of fields",
        })
        return
      }
      if (recipientsname.length < 3) {
        res.status(400).json({
          status: false,
          message:
            "Recipient's Name is invalid! Must be greater than or equal to 3",
        })
        return
      }
      if (recipientsphonenumber.length < 11) {
        res.status(400).json({
          status: false,
          message:
            "Recipient's Phone Number is invalid! Must be greater than or equal to 11",
        })
        return
      }
      if (address.length < 3) {
        res.status(400).json({
          status: false,
          message: "Address is invalid! Must be greater than or equal to 3",
        })
        return
      }
      if (isNaN(postalcode) || postalcode.length != 5) {
        res.status(400).send({
          status: false,
          message:
            "Postal Code is invalid! Must be an integer and length equal to 5",
        })
      }
      if (city.length < 3) {
        res.status(400).json({
          status: false,
          message: "City is invalid! Must be greater than or equal to 3",
        })
        return
      }
      if (isNaN(user_id)) {
        res.status(400).send({
          status: false,
          message: "User ID is Not a Number",
        })
      }
      const payload = {
        addressas,
        recipientsname,
        recipientsphonenumber,
        address,
        postalcode,
        city,
        user_id,
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
          addressas,
          recipientsname,
          recipientsphonenumber,
          address,
          postalcode,
          city,
          user_id,
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
        addressas: addressas ?? checkData[0].addressas,
        recipientsname: recipientsname ?? checkData[0].recipientsname,
        recipientsphonenumber:
          recipientsphonenumber ?? checkData[0].recipientsphonenumber,
        address: address ?? checkData[0].address,
        postalcode: postalcode ?? checkData[0].postalcode,
        city: city ?? checkData[0].city,
        user_id: user_id ?? checkData[0].user_id,
      }
      if (payload.recipientsname.length < 3) {
        res.status(400).json({
          status: false,
          message:
            "Recipient's Name is invalid! Must be greater than or equal to 3",
        })
        return
      }
      if (payload.recipientsphonenumber.length < 11) {
        res.status(400).json({
          status: false,
          message:
            "Recipient's Phone Number is invalid! Must be greater than or equal to 11",
        })
        return
      }
      if (payload.address.length < 3) {
        res.status(400).json({
          status: false,
          message: "Address is invalid! Must be greater than or equal to 3",
        })
        return
      }
      if (isNaN(payload.postalcode) || payload.postalcode.length != 5) {
        res.status(400).send({
          status: false,
          message:
            "Postal Code is invalid! Must be an integer and length equal to 5",
        })
      }
      if (payload.city.length < 3) {
        res.status(400).json({
          status: false,
          message: "City is invalid! Must be greater than or equal to 3",
        })
        return
      }
      if (isNaN(payload.user_id)) {
        res.status(400).send({
          status: false,
          message: "User ID is Not a Number",
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

const deleteAddress = async (req, res) => {
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
      const query = await model.deleteAddress(id)
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
  deleteAddress,
}
