const db = require("../database")

const getAll = async (sortType, id) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() AS full_count FROM orders WHERE user_id = ${id} ORDER BY created_at ${sortType}`
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

const getByUserId = async (user_id, sortType) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() AS full_count FROM orders WHERE user_id = ${user_id} ORDER BY created_at ${sortType}`
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
      "address_id",
      "total",
      "created_at",
      "payment_id",
      "order_status"
    )} returning *`
    return query
  } catch (error) {
    return error
  }
}

const update = async (payload, id) => {
  try {
    const query = await db`UPDATE orders SET ${db(
      payload,
      "product_id",
      "user_id",
      "quantity",
      "address_id",
      "total",
      "created_at",
      "payment_id",
      "order_status"
    )} WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

const deleteOrders = async (id) => {
  try {
    const query = await db`DELETE FROM orders WHERE id = ${id} returning *`
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
  deleteOrders,
}
