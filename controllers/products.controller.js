const model = require("../models/products.models")
const db = require("../database")
const jwt = require("jsonwebtoken")
const cloudinary = require("../cloudinary")

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
    const keyword = `%${req?.query?.keyword}%`
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
    if (req?.query?.keyword) {
      query = await model.getAll(keyword, sort)
    } else {
      query = await model.getAll(null, sort)
    }
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

const getByCategory = async (req, res) => {
  try {
    const {
      params: { category },
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
    query = await model.getByCategory(category, sort)
    if (!query?.length) {
      res.status(400).json({
        status: false,
        message: `Category ${category} not found!`,
      })
    }
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

const create = async (req, res) => {
  try {
    const { title, price, stock, description, category } = req.body
    if (!(title && price && stock && description && category)) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      })
      return
    }
    if (title.split(" ").length < 2) {
      res.status(400).json({
        status: false,
        message: "Title is invalid! Must be greater than or equal to 2 words",
      })
      return
    }
    const { productpictures } = req?.files ?? {}
    if (!productpictures) {
      res.status(400).send({
        status: false,
        message: "Recipe Picture is required",
      })
    }
    let mimeType = productpictures.mimetype.split("/")[1]
    let allowFile = ["jpeg", "jpg", "png", "webp"]
    if (!allowFile?.find((item) => item === mimeType)) {
      res.status(400).send({
        status: false,
        message: "Only accept jpeg, jpg, png, webp",
      })
    }
    if (productpictures.size > 2000000) {
      res.status(400).send({
        status: false,
        message: "File to big, max size 2MB",
      })
    }
    if (isNaN(stock)) {
      res.status(400).send({
        status: false,
        message: "Stock is Not a Number",
      })
    }
    const upload = cloudinary.uploader.upload(productpictures.tempFilePath, {
      public_id: new Date().toISOString(),
    })
    upload
      .then(async (data) => {
        const payload = {
          productpictures: data?.secure_url,
          title,
          price,
          stock,
          description,
          category,
        }
        await model.create(payload)
        res.status(200).send({
          status: true,
          message: "Success insert data",
          data: payload,
        })
      })
      .catch((err) => {
        res.status(400).send({
          status: false,
          message: err,
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
        body: { title, price, stock, description, category },
      } = req
      let checkData = await model.getById(id)
      if (!checkData?.length) {
        res.json({
          status: false,
          message: `ID ${id} not found!`,
        })
      }
      const payload = {
        title: title ?? checkData[0].title,
        price: price ?? checkData[0].price,
        stock: stock ?? checkData[0].stock,
        description: description ?? checkData[0].description,
        category: category ?? checkData[0].category,
      }
      if (payload.title.split(" ").length < 2) {
        res.status(400).json({
          status: false,
          message: "Title is invalid! Must be greater than or equal to 2 words",
        })
        return
      }
      if (isNaN(payload.stock)) {
        res.status(400).send({
          status: false,
          message: "Stock is Not a Number",
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

const deleteProducts = async (req, res) => {
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
      const query = await model.deleteProducts(id)
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
  getByCategory,
  create,
  update,
  //   updatePhoto,
  deleteProducts,
}
