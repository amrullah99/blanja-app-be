const db = require("../database")

const getAll = async (keyword, sortType) => {
  try {
    let query
    if (keyword != null) {
      query =
        await db`SELECT *, count(*) OVER() AS full_count FROM products WHERE LOWER(products.title) LIKE LOWER(${keyword}) ORDER BY id ${sortType}`
    } else {
      query =
        await db`SELECT *, count(*) OVER() AS full_count FROM products ORDER BY id ${sortType}`
    }
    return query
  } catch (error) {
    return error
  }
}

const getById = async (id) => {
  try {
    const query = await db`SELECT * FROM products where id = ${id}`
    return query
  } catch (error) {
    return error
  }
}

const getByCategory = async (category, sortType) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() AS full_count FROM products WHERE LOWER(category) LIKE LOWER(${category}) ORDER BY id ${sortType}`
    return query
  } catch (error) {
    return error
  }
}

const create = async (payload) => {
  try {
    const query = await db`INSERT INTO products ${db(
      payload,
      "title",
      "productpictures",
      "price",
      "stock",
      "description",
      "category"
    )} returning *`
    return query
  } catch (error) {
    return error
  }
}

const update = async (payload, id) => {
  try {
    const query = await db`UPDATE products SET ${db(
      payload,
      "title",
      "price",
      "stock",
      "description",
      "category"
    )} WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

const deleteProducts = async (id) => {
  try {
    const query = await db`DELETE FROM products WHERE id = ${id} returning *`
    return query
  } catch (error) {
    return error
  }
}

module.exports = {
  getAll,
  getById,
  getByCategory,
  create,
  update,
  deleteProducts,
}
