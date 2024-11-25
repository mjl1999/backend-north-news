const db = require("../db/connection")


exports.retrieveTopics = async () => {
    const query = 'SELECT * FROM topics;'
    const result = await db.query(query)
    console.log("getting result ", result)
    return result.rows
}