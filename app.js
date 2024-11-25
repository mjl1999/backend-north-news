const express = require("express");
const app = express();
const {
  postgresErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error");
const { getApi, getApiTopics, getArticle} = require("./controllers/api.controller");

app.get("/api", getApi);

app.get("/api/topics", getApiTopics);


app.get("/api/articles/:article_id", getArticle);


// error handling below
app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route Not Found" });
});
app.use(postgresErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
