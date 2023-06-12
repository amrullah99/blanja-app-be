const emailValidation = require("../email.validation")
const bcrypt = require("bcrypt")
const saltRounds = 10
const model = require("../models/users.models")
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
    jwt.verify(getToken(req), process.env.JWT_PRIVATE_KEY, async () => {
      let sort = db`DESC`
      if (req?.query?.sortType?.toLowerCase() === "asc") {
        sort = db`ASC`
      }
      const query = await model.getAll(sort)
      res.send({
        status: true,
        message: "Get data success",
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

const getById = async (req, res) => {
  try {
    jwt.verify(getToken(req), process.env.JWT_PRIVATE_KEY, async () => {
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
        res.json({
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

const create = async (req, res) => {
  try {
    const { fullname, email, password } = req.body
    if (!(fullname && email && password)) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      })
      return
    }
    const { valid, reason, validators } = await emailValidation.isEmailValid(
      email
    )
    if (!valid) {
      res.status(400).json({
        status: false,
        message: "Email is invalid!",
        reason: validators[reason].reason,
      })
      return
    }
    const isEmailUnique = await emailValidation.isEmailUnique(email)
    if (isEmailUnique) {
      res.status(400).json({
        status: false,
        message: "Email already in use!",
      })
      return
    }
    if (fullname.length < 3) {
      res.status(400).json({
        status: false,
        message: "Fullname is invalid! Must be greater than or equal to 3",
      })
      return
    }
    // if (phonenumber.length < 11) {
    //   res.status(400).json({
    //     status: false,
    //     message: "Phone Number is invalid! Must be greater than or equal to 11",
    //   })
    //   return
    // }
    if (password.length < 6) {
      res.status(400).json({
        status: false,
        message: "Password is invalid! Must be greater than or equal to 6",
      })
      return
    }
    const payload = {
      fullname,
      email,
      password,
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        // Store hash in your password DB.
        const query = await model.create({ ...payload, password: hash })
        res.send({
          status: true,
          message: "Success insert data",
          data: query,
        })
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { id }) => {
        const {
          body: { fullname, email, password, phonenumber, gender, dateofbirth },
        } = req
        let checkData = await model.getById(id)
        if (!checkData?.length) {
          res.json({
            status: false,
            message: `ID ${id} not found!`,
          })
        }
        const payload = {
          email: email ?? checkData[0].email,
          fullname: fullname ?? checkData[0].fullname,
          phonenumber: phonenumber ?? checkData[0].phonenumber,
          password: password ?? checkData[0].password,
          gender: gender ?? checkData[0].gender,
          dateofbirth: dateofbirth ?? checkData[0].dateofbirth,
        }
        const { valid, reason, validators } =
          await emailValidation.isEmailValid(payload.email)
        if (!valid) {
          res.status(400).json({
            status: false,
            message: "Email is invalid!",
            reason: validators[reason].reason,
          })
          return
        }
        const isEmailUnique = await emailValidation.isEmailUnique(
          payload.email,
          checkData[0].id
        )
        if (isEmailUnique) {
          res.status(400).json({
            status: false,
            message: "Email already in use!",
          })
          return
        }
        if (payload.fullname.length < 3) {
          res.status(400).json({
            status: false,
            message: "Fullname is invalid! Must be greater than or equal to 3",
          })
          return
        }
        if (payload.phonenumber.length < 11) {
          res.status(400).json({
            status: false,
            message:
              "Phone Number is invalid! Must be greater than or equal to 11",
          })
          return
        }
        if (payload.password.length < 6) {
          res.status(400).json({
            status: false,
            message: "Password is invalid! Must be greater than or equal to 6",
          })
          return
        }
        if (password) {
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
              payload.password = hash
              const query = await model.update(payload, id)
              res.send({
                status: true,
                message: "Success edit data",
                data: query,
              })
            })
          })
        } else {
          const query = await model.update(payload, id)
          res.send({
            status: true,
            message: "Success edit data",
            data: query,
          })
        }
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

const updatePhoto = async (req, res) => {
  try {
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { id }) => {
        const { photo } = req?.files ?? {}
        if (!photo) {
          res.status(400).send({
            status: false,
            message: "Photo is required",
          })
          return
        }
        let mimeType = photo.mimetype.split("/")[1]
        let allowFile = ["jpeg", "jpg", "png", "webp"]
        if (!allowFile?.find((item) => item === mimeType)) {
          res.status(400).send({
            status: false,
            message: "Only accept jpeg, jpg, png, webp",
          })
          return
        }
        if (photo.size > 2000000) {
          res.status(400).send({
            status: false,
            message: "File to big, max size 2MB",
          })
          return
        }
        const upload = cloudinary.uploader.upload(photo.tempFilePath, {
          public_id: new Date().toISOString(),
        })
        upload
          .then(async (data) => {
            const payload = {
              profilepicture: data?.secure_url,
            }
            await model.updatePhoto(payload, id)
            res.status(200).send({
              status: true,
              message: "Success upload",
              data: payload,
            })
          })
          .catch((err) => {
            res.status(400).send({
              status: false,
              message: err,
            })
          })
      }
    )
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error on server",
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const checkData = await model.getById(id)
    if (!checkData?.length) {
      res.status(404).json({
        status: false,
        message: `ID ${id} not found`,
      })
      return
    }
    const query = await model.deleteUser(id)
    res.send({
      status: true,
      message: "Success delete data",
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

module.exports = {
  getAll,
  getById,
  create,
  update,
  updatePhoto,
  deleteUser,
}
