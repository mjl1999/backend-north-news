const express = require("express");
const app = express();
const {
  postgresErrorHandler,
  customErrorHandler,
  serverErrorHandler
} = require("./error");
const { 
  getApi, 
  getApiTopics, 
  getArticle, 
  getArticles, 
  getArticleComments,
  postArticleComment,

  updateArticle,
  deleteComment

} = require("./controllers/api.controller");

app.use(express.json())
app.get("/api", getApi);

app.get("/api/topics", getApiTopics);


app.get("/api/articles/:article_id", getArticle);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postArticleComment);


app.patch("/api/articles/:article_id", updateArticle);


app.delete("/api/comments/:comment_id", deleteComment)

/* 
CORE: DELETE /api/comments/:comment_id
Description
Should:

be available on /api/comments/:comment_id.
delete the given comment by comment_id.
Responds with:

status 204 and no content.
Consider what errors could occur with this endpoint, and make sure to test for them.

Remember to add a description of this endpoint to your /api endpoint.
*/




// error handling below
app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route Not Found" });
});
app.use(postgresErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
