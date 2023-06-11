const db = require("../database")

const getAll = async (sortType) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() AS full_count FROM address ORDER BY id ${sortType}`
    return query
  } catch (error) {
    return error
  }
}

const getById = async (id) => {
  try {
    const query = await db`SELECT * FROM address WHERE id = ${id}`
    return query
  } catch (error) {
    return error
  }
}

const getByUserId = async (user_id) => {
  try {
    const query = await db`SELECT * FROM address WHERE user_id = ${user_id}`
    return query
  } catch (error) {
    return error
  }
}

const create = async (payload) => {
  try {
    const query = await db`INSERT INTO address ${db(
      payload,
      "addressas",
      "recipientsname",
      "recipientsphonenumber",
      "address",
      "postalcode",
      "city",
      "user_id"
    )} returning *`
    return query
  } catch (error) {
    return error
  }
}

const update = async (payload, id) => {
  try {
    const query = await db`UPDATE address SET ${db(
      payload,
      "addressas",
      "recipientsname",
      "recipientsphonenumber",
      "address",
      "postalcode",
      "city",
      "user_id"
    )} WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

const deleteAddress = async (id) => {
  try {
    const query = await db`DELETE FROM address WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
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
