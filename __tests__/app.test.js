const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app")
/* Set up your test imports here */
const db = require("../db/seeds/seed"); // the file we use seed to enter data into the database
const data = require("../db/data/test-data"); // the initial test data to reseed our file with
const dbConnection = require("../db/connection");

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
