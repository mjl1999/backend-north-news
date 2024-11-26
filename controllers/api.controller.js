const endpointsOverview = require("../endpoints.json");
const {
  retrieveTopics,
  retrieveArticle,
  retrieveAllArticles,
  retrieveArticleComments,
  postComment,
  patchArticle
} = require("../models/api.models");

exports.getApi = (req, res, next) => {
  try {
    res.status(200).send({ endpoints: endpointsOverview });
  } catch (err) {
    next(err);
  }
};

exports.getApiTopics = async (req, res, next) => {
  try {
    const topics = await retrieveTopics();
    res.status(200).send({ allTopics: topics });
  } catch (err) {
    next(err);
  }
};

exports.getArticle = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const article = await retrieveArticle(article_id);
    res.status(200).send({ chosenArticle: article });
  } catch (err) {
    next(err);
  }
};

exports.getArticles = async (req, res, next) => {
  try {
    const articles = await retrieveAllArticles();
    res.status(200).send({ allArticles: articles });
  } catch (err) {
    next(err);
  }
};

exports.getArticleComments = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const article_comments = await retrieveArticleComments(article_id);
    res.status(200).send({ allArticleComments: article_comments });
  } catch (err) {
    next(err);
  }
};


exports.postArticleComment = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const {username, body} = req.body
        const comment_posted = await postComment(article_id, username, body);
        res.status(201).send({ userComment: comment_posted });
      } catch (err) {
        next(err);
      }
}

exports.updateArticle = async (req, res, next) => {
    try {
        const { article_id } = req.params;
        const {inc_votes} = req.body
        const patchedArticle = await patchArticle(article_id, inc_votes);
        res.status(201).send({ updatedArticle: patchedArticle });
      } catch (err) {
        next(err);
      }
}