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
      inc_votes: 100,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(updateVotes)
      .expect(201)
      .then(({ body: { updatedArticle } }) => {
        expect(Object.keys(updatedArticle)).toHaveLength(8);
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
        expect(updatedArticle.votes >= 100).toBe(true);
      });
  });


  test("responds with appropriate error when passed invalid increment type", () => {
    const updateVotes = {
      inc_votes: "ten",
    };
    return request(app)
      .patch("/api/articles/2")
      .send(updateVotes)
      .expect(400).then(({body: {msg}})=> {
        expect(msg).toBe("inc_votes is not a number")
      })
  })


  test("responds with appropriate error when not passed inc_votes", () => {
    const updateVotes = {
      inc_null: 10
    };
    return request(app)
      .patch("/api/articles/2")
      .send(updateVotes)
      .expect(400).then(({body: {msg}})=> {
        expect(msg).toBe("inc_votes is not defined")
      })
  })



  test("responds with appropriate error when trying to patch to a non-existent article", () => {
    const updateVotes = {
      inc_votes: 10
    };
    return request(app)
      .patch("/api/articles/donuts")
      .send(updateVotes)
      .expect(400).then(({body: {msg}})=> {
        expect(msg).toBe("Bad Request: invalid id")
      })
  })


});

describe("DELETE /api/comments/:comment_id", () => {
  test("removes comment based on comment_id", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });
});

describe("GET /api/users", () => {
  test("gives status of 200 and responds with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { allUsers } }) => {
        allUsers.forEach((user) => {
          expect(Object.keys(user)).toHaveLength(3);
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles?sort_by=votes&order=asc", () => {
  test("gives status of 200 and responds with all articles sorted by votes and ordered by ascending", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
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

        expect(allArticles).toBeSortedBy("votes", { ascending: true });
      });
  });

  test("gives status of 400 and responds with bad request when passed invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=DROPTABLE&order=asc")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("sort_by Not Found");
      });
  });

  test("gives status of 400 and responds with bad request when passed invalid order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=DROPTABLE")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("order Not Found");
      });
  });
});

describe("GET /api/articles?topic=mitch&order=asc", () => {
  test("gives status of 200 and responds with all articles belonging to specific topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch&order=asc")
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

        expect(allArticles).toBeSortedBy("topic", { ascending: true });
      });
  });

  test("gives status of 400 and responds with bad request when passed invalid topic", () => {
    return request(app)
      .get("/api/articles?topic=DROPTABLE&order=asc")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("topic Not Found");
      });
  });
});
