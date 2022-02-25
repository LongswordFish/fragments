// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const { createHash } = require('crypto');

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments/anyid/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments/anyid/info').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with the fragment metadata
  test('authenticated users get a fragment', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const id = res.body.fragment.id;
    const returnId = createHash('sha256').update('user1@email.com').digest('hex');
    const res2 = await request(app).get(`/v1/fragments/${id}/info`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(200);
    expect(res2.body.status).toBe('ok');
    expect(res2.body.fragment.id).toBe(id);
    expect(res.body.fragment.type).toBe("text/plain");
    expect(res.body.fragment.size).toBe(17);
    expect(res.body.fragment.ownerId).toBe(returnId);
    expect(res.body.fragment.created).not.toBeNull();
  });

  // the return value will return 404 if the id doesn't not exist
  test('Not exist id will return 404', async () => {
    await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const res2 = await request(app).get(`/v1/fragments/notRealId/info`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
    expect(res2.body.error.message).toBe("Fragment doesn't exist");

  });

  // the return value will return 404 if the fragment doesn't belong to the user
  test('Not owned id will return 404', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const id = res.body.fragment.id;

    const res2 = await request(app).get(`/v1/fragments/${id}/info`).auth('user2@email.com', 'password2');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
    expect(res2.body.error.message).toBe("Fragment doesn't exist");

  });

});
