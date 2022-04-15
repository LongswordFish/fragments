// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments/anyid').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments/anyid').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with the fragment data
  test('authenticated users get a fragment', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const id = res.body.fragment.id;
    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.text).toBe("this is the value");
  });

  // the return value will return 404 if the id doesn't not exist
  test('Not exist id will return 404', async () => {
    await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const res2 = await request(app).get(`/v1/fragments/notRealId`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
    expect(res2.body.error.message).toBe("Fragment doesn't exist");

  });

  // the return value will return 404 if the fragment doesn't belong to the user
  test('Not owned id will return 404', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const id = res.body.fragment.id;

    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user2@email.com', 'password2');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
    expect(res2.body.error.message).toBe("Fragment doesn't exist");

  });

  // Id with ".txt" extension will return the content
  test('Id with ".txt" extension will return the content', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const id = res.body.fragment.id;

    const res2 = await request(app).get(`/v1/fragments/${id}.txt`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(200);
    expect(res2.text).toBe("this is the value");

  });

  // if the fragment can be converted
  test('if the data can be converted, return converted data', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/markdown').send("this is the value");
    const id = res.body.fragment.id;

    const res2 = await request(app).get(`/v1/fragments/${id}.html`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(200);
    expect(res2.text).toEqual("<p>this is the value</p>\n");

  });

  // if the fragment cannot be converted
  test('if the data cannot be converted, return converted data', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const id = res.body.fragment.id;

    const res2 = await request(app).get(`/v1/fragments/${id}.html`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(415);
    expect(res2.body.error.message).toBe("a text/plain fragment cannot be returned as a .html");

  });

});
