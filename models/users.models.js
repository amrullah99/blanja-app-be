const db = require("../database")

const getAll = async (sortType) => {
  try {
    const query = await db`SELECT * FROM users ORDER BY id ${sortType}`
    return query
  } catch (error) {
    return error
  }
}

const getById = async (id) => {
  try {
    const query = await db`SELECT * FROM users where id = ${id}`
    return query
  } catch (error) {
    return error
  }
}

const getByEmail = async (email) => {
  try {
    const query =
      await db`SELECT * FROM users where LOWER(email) = LOWER(${email})`
    return query
  } catch (error) {
    return error
  }
}

const create = async (payload) => {
  try {
    const query = await db`INSERT INTO users ${db(
      payload,
      "fullname",
      "email",
      "password"
    )} returning *`
    return query
  } catch (error) {
    return error
  }
}

const update = async (payload, id) => {
  try {
    const query = await db`UPDATE users SET ${db(
      payload,
      "fullname",
      "email",
      "password",
      "phonenumber",
      "gender",
      "dateofbirth"
    )} WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

const updatePhoto = async (payload, id) => {
  try {
    const query = await db`UPDATE users set ${db(
      payload,
      "profilepicture"
    )} WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

const deleteUser = async (id) => {
  try {
    const query = await db`DELETE FROM users WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

module.exports = {
  getAll,
  getById,
  getByEmail,
  create,
  update,
  updatePhoto,
  deleteUser,
}
