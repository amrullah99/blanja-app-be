const db = require("../database")

const create = async (payload) => {
  try {
    const query = await db`INSERT INTO payment ${db(
      payload,
      "user_id",
      "token",
      "paymentstatus",
      "order_id"
    )} returning *`
    return query
  } catch (error) {
    return error
  }
}

module.exports = {
  create,
}
