
const db = require("../db/connection");

exports.retrieveTopics = async () => {
  const query = "SELECT * FROM topics;";
  const result = await db.query(query);
  //console.log("getting result ", result);
  return result.rows;
};

exports.retrieveArticle = async (id) => {
  if (Number.isInteger(Number(id))) {
    const query = "SELECT * FROM articles WHERE article_id = $1;";
    const result = await db.query(query, [id]);
    // console.log("getting result ", result.rows)
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    const error = new Error("Article ID not Found");
    error.status = 404;
    throw error;
  } else {
    const error = new Error("Bad request: invalid id");
    error.status = 400;
    throw error;
  }
};

exports.retrieveAllArticles = async () => {
  //count functionality https://database.guide/sql-count-for-beginners/ 
  const query = `
    SELECT
    articles.article_id,
    articles.title,
    articles.topic,
    articles.author,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comment_id) AS comment_count
    FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`;

  const articles = await db.query(query);
  // console.log(articles.rows, "<<<articles", typeof articles.rows);
  articles.rows.forEach((obj)=> {
    obj["comment_count"] = Number(obj["comment_count"])
  })
  return articles.rows;
};