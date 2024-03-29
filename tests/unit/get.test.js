// tests/unit/get.test.js

const request = require('supertest');
const { createHash } = require('crypto');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // the return value will not have attributes like size, or type if not expand
  test('Only id attribute will return if not expand', async () => {
    await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments[0]).toMatch(/[A-Za-z0-9_-]+/);
    expect(res.body.fragments[0].type).toBe(undefined);
    expect(res.body.fragments[0].size).toBe(undefined);
    expect(res.body.fragments[0].ownerId).toBe(undefined);
    expect(res.body.fragments[0].created).toBe(undefined);
  });


  // the return value will have attributes like size, or type if not expand
  test('All attributes will return if not expand', async () => {
    await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    const res = await request(app).get('/v1/fragments?expand=1').auth('user1@email.com', 'password1');

    const returnId = createHash('sha256').update('user1@email.com').digest('hex');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments[0].id).toMatch(/[A-Za-z0-9_-]+/);
    expect(res.body.fragments[0].type).toBe("text/plain");
    expect(res.body.fragments[0].size).toBe(Buffer.byteLength("this is the value"));
    expect(res.body.fragments[0].ownerId).toBe(returnId);
    expect(res.body.fragments[0].created).not.toBeNull();
  });

});
