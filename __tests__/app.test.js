const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
/* Set up your test imports here */
const db = require("../db/seeds/seed"); // the file we use seed to enter data into the database
const data = require("../db/data/test-data"); // the initial test data to reseed our file with
const dbConnection = require("../db/connection");
require("jest-sorted");

afterAll(() => {
  return dbConnection.end();
});

beforeEach(() => {
  return db(data);
});
/* Set up your beforeEach & afterAll functions here */

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("gives status of 200 and responds with an object of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { allTopics } }) => {
        allTopics.forEach((topic) => {
          expect(Object.keys(topic)).toHaveLength(2);
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("gives status of 200 and responds with the appropriate article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { chosenArticle } }) => {
        expect(Object.keys(chosenArticle)).toHaveLength(8);
        expect(chosenArticle).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("gives status of 200 and responds with all articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        allArticles.forEach((article) => {
          expect(Object.keys(article)).toHaveLength(8);
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });

        expect(allArticles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Responds with an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { allArticleComments } }) => {
        allArticleComments.forEach((comment) => {
          expect(Object.keys(comment)).toHaveLength(6);
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
        expect(allArticleComments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("posts a new comment for a given article", () => {
    const comment = {
      username: "butter_bridge",
      body: "testing, testing 123",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(201)
      .then(({ body: { userComment } }) => {
        expect(Object.keys(userComment)).toHaveLength(6);
        expect(userComment).toEqual(
          expect.objectContaining({
            author: "butter_bridge",
            body: "testing, testing 123",
            article_id: 2,
            votes: 0,
          })
        );

        expect(userComment).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
});


describe("PATCH /api/articles/:article_id", () => {
  test("updates votes on an article", () => {
    const updateVotes = {
      inc_votes: 100
    };
    return request(app)
      .patch("/api/articles/2")
      .send(updateVotes)
      .expect(201)
      .then(({ body: { updatedArticle } }) => {
        expect(Object.keys(updatedArticle)).toHaveLength(8)
        expect(updatedArticle).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
        expect(updatedArticle.votes >= 100).toBe(true)

        
      });
  });
});
