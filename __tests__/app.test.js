const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app")
/* Set up your test imports here */
const db = require("../db/seeds/seed"); // the file we use seed to enter data into the database
const data = require("../db/data/test-data"); // the initial test data to reseed our file with
const dbConnection = require("../db/connection");
require("jest-sorted")

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
        expect(chosenArticle).toMatchObject(
          { 
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          }
        )
        
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
        
        
        expect(allArticles).toBeSortedBy('created_at', { descending: true });
      });
  });
});