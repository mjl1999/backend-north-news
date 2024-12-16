const express = require("express");
const app = express();
const cors = require('cors')
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
  updateComments,
  postNewArticle,
  postNewTopic,
  deleteArticle

} = require("./controllers/api.controller");

app.use(cors())
app.use(express.json())

app.get("/api", getApi);

app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postArticleComment);
app.post("/api/articles", postNewArticle);
app.patch("/api/articles/:article_id", updateArticle);
app.delete("/api/articles/:article_id", deleteArticle)

app.patch("/api/comments/:comment_id", updateComments);
app.delete("/api/comments/:comment_id", deleteComment)

app.get("/api/users", getUsers);
app.get("/api/users/:username", getUsersByUsername);

app.get("/api/topics", getApiTopics);
app.post("/api/topics", postNewTopic);


app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route Not Found" });
});
app.use(postgresErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
