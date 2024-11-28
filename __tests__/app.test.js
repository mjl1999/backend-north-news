const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
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
        expect(allTopics.length).toBeGreaterThan(0);
        allTopics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("gives status of 200 and responds with the appropriate article with comment count", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { chosenArticle } }) => {
        expect(chosenArticle).toMatchObject({
          article_id: 2,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });

  test("gives status of 404 for non-existent id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article ID not Found");
      });
  });

  test("gives status of 400 and error message for invalid article_id (non-numeric)", () => {
    return request(app)
      .get("/api/articles/DROPTABLE")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid id");
      });
  });
});

describe("GET /api/articles", () => {
  test("gives status of 200 and responds with all articles sorted by date of creation", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles.length).toBeGreaterThan(0);
        allArticles.forEach((article) => {
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
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 2,
          });
        });
        expect(allArticleComments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("posts a new comment for a given article and responds with the posted comment", () => {
    const comment = {
      username: "butter_bridge",
      body: "testing, testing 123",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(201)
      .then(({ body: { userComment } }) => {
        expect(userComment).toEqual(
          expect.objectContaining({
            author: "butter_bridge",
            body: "testing, testing 123",
            article_id: 2,
            votes: 0,
            comment_id: expect.any(Number),
            created_at: expect.any(String),
          })
        );
      });
  });

  test("gives 400 for bad request if given bad article id", () => {
    const comment = {
      username: "butter_bridge",
      body: "testing, testing 123",
    };
    return request(app)
      .post("/api/articles/hello/comments")
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid id");
      });
  });

  test("gives 404 for non-existent id", () => {
    const comment = {
      username: "butter_bridge",
      body: "testing, testing 123",
    };
    return request(app)
      .post("/api/articles/999/comments")
      .send(comment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article ID not Found");
      });
  });

  test("gives 400 for incomplete comment", () => {
    const comment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          "Incomplete request body: make sure username and comment body are present"
        );
      });
  });

  test("gives 400 for username that does not exist", () => {
    const comment = {
      username: "butter_burn",
      body: "testing, testing 123",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(comment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User does not exist");
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
        expect(updatedArticle).toMatchObject({
          article_id: 2,
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
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("inc_votes is not a number");
      });
  });

  test("responds with appropriate error when not passed inc_votes", () => {
    const updateVotes = {
      inc_null: 10,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(updateVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("inc_votes is not defined");
      });
  });

  test("responds with appropriate error when trying to patch to a non-existent article", () => {
    const updateVotes = {
      inc_votes: 10,
    };
    return request(app)
      .patch("/api/articles/donuts")
      .send(updateVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid id");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("removes comment based on valid comment_id", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });

  test("returns error if given invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/hello")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: invalid comment id");
      });
  });

  test("returns error if comment id does not exist", () => {
    return request(app)
      .delete("/api/comments/50000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment Id Not Found");
      });
  });
});

describe("GET /api/users", () => {
  test("gives status of 200 and responds with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { allUsers } }) => {
        expect(allUsers.length).toBeGreaterThan(0);
        allUsers.forEach((user) => {
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
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid sort_by column");
      });
  });

  test("gives status of 400 and responds with bad request when passed invalid order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=DROPTABLE")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid order value");
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

describe("GET /api/users/:username", () => {
  test("gives status of 200 and with specific user", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then(({ body: { specifiedUser } }) => {
        expect([specifiedUser].length).toBeGreaterThan(0);
        expect(specifiedUser).toMatchObject({
          username: "icellusedkars",
          name: "sam",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
        });
      });
  });

  test("", () => {
    return request(app)
      .get("/api/users/bicycletricycle")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User Not Found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("updates votes on a comment", () => {
    const updateVotes = {
      inc_votes: 100,
    };
    return request(app)
      .patch("/api/comments/2")
      .send(updateVotes)
      .expect(201)
      .then(({ body: { updatedComment } }) => {
        expect(updatedComment).toMatchObject({
          comment_id: 2,
          article_id: expect.any(Number),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
        expect(updatedComment.votes >= 100).toBe(true);
      });
  });

  test("responds with appropriate error when passed invalid increment type", () => {
    const updateVotes = {
      inc_votes: "ten",
    };
    return request(app)
      .patch("/api/comments/2")
      .send(updateVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("inc_votes is not a number");
      });
  });

  test("responds with appropriate error when not passed inc_votes", () => {
    const updateVotes = {
      inc_null: 10,
    };
    return request(app)
      .patch("/api/comments/2")
      .send(updateVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("inc_votes is not defined");
      });
  });

  test("responds with appropriate error when trying to patch to an invalid comment id", () => {
    const updateVotes = {
      inc_votes: 10,
    };
    return request(app)
      .patch("/api/comments/donuts")
      .send(updateVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid comment_id");
      });
  });

  test("responds with appropriate error when trying to patch to a non-existent comment id", () => {
    const updateVotes = {
      inc_votes: 10,
    };
    return request(app)
      .patch("/api/comments/10000")
      .send(updateVotes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment ID Not Found");
      });
  });
});

describe("POST /api/articles", () => {
  test("posts a new article", () => {
    const article = {
      author: "icellusedkars",
      title: "I love laptops",
      body: "That's all i wanted to say",
      topic: "mitch",
    };
    return request(app)
      .post("/api/articles")
      .send(article)
      .expect(201)
      .then(({ body: { postedArticle } }) => {
        expect(postedArticle).toEqual(
          expect.objectContaining({
            author: "icellusedkars",
            title: "I love laptops",
            body: "That's all i wanted to say",
            topic: "mitch",
            article_img_url: `https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700`,
            votes: 0,
            article_id: 14,
            created_at: expect.any(String),
            comment_count: 0,
          })
        );
      });
  });

  test("responds with 400 if request fields are missing: ", () => {
    const article = {
      author: "icellusedkars",
      title: "I love laptops",
      body: "That's all i wanted to say",
    };
    return request(app)
      .post("/api/articles")
      .send(article)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Request Body Incomplete");
      });
  });

  test("responds with 400 if request fields have wrong data types or values: ", () => {
    const article = {
      author: 1,
      title: 2,
      body: 3,
      topic: 5,
    };
    return request(app)
      .post("/api/articles")
      .send(article)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
