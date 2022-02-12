// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

const { createHash } = require('crypto');



describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair with a supported type should give a success result
  test('authenticated users get a fragment', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // Successful result should have all the attributes
  test('Successful result should have all the attributes', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the value");

    const returnId = createHash('sha256').update('user1@email.com').digest('hex');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toMatch(/[A-Za-z0-9_-]+/);
    expect(res.body.fragment.type).toBe("text/plain");
    expect(res.body.fragment.size).toBe(17);
    expect(res.body.fragment.ownerId).toBe(returnId);
    expect(res.body.fragment.created).not.toBeNull();
    expect(res.headers['location']).toBe(`${process.env.API_URL}:8080/v1/fragments/${res.body.fragment.id}`)

  });

  //unsupported type will fail
  test('unsupported type will fail', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'application/json').send({ 'object': 'object' });
    expect(res.statusCode).toBe(415);
    //expect(res.body.status).toBe('ok');
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
