const db = require("../database")

const getAll = async (sortType, id) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() AS full_count FROM orders WHERE user_id = ${id} ORDER BY id ${sortType}`
    return query
  } catch (error) {
    console.log(error)
    return error
  }
}

const getById = async (id) => {
  try {
    const query = await db`SELECT * FROM orders WHERE id = ${id}`
    return query
  } catch (error) {
    return error
  }
}

const create = async (payload) => {
  try {
    const query = await db`INSERT INTO orders ${db(
      payload,
      "product_id",
      "user_id",
      "quantity",
      "paymentmethod",
      "address_id",
      "total"
    )} returning *`
    return query
  } catch (error) {
    return error
  }
}

module.exports = {
  getAll,
  getById,
  create,
}
