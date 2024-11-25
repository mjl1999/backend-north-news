const db = require("../db/connection")


exports.retrieveTopics = async () => {
    const query = 'SELECT * FROM topics;'
    const result = await db.query(query)
    console.log("getting result ", result)
    return result.rows
}


exports.retrieveArticle = async (id) => {
    if (Number.isInteger(Number(id))) {
    const query = 'SELECT * FROM articles WHERE article_id = $1;'
    const result = await db.query(query, [id])
    // console.log("getting result ", result.rows)
        if (result.rows.length > 0) {
            return result.rows[0]
        }
        const error = new Error('Article ID not Found');
        error.status = 404;
        throw error;
    }

    else {
        const error = new Error('Bad request: invalid id');
        error.status = 400;
        throw error;
    }
    
}