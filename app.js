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
  deleteComment,
  getUsers,
  getUsersByUsername,
  updateComments

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


app.get("/api/users", getUsers);

app.get("/api/users/:username", getUsersByUsername);

app.patch("/api/comments/:comment_id", updateComments);


app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route Not Found" });
});
app.use(postgresErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
