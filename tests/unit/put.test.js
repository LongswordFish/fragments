// tests/unit/put.test.js

const request = require('supertest');

const app = require('../../src/app');

const { createHash } = require('crypto');



describe('PUT /v1/fragments', () => {

  var FRAGMENT_ID;
  var CREATED;

  beforeAll(async () => {
    const content = Buffer.from("this is the value");
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send(content);
    FRAGMENT_ID = res.body.fragment.id;
    CREATED = res.body.fragment.created;
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).put(`/v1/fragments/${FRAGMENT_ID}`).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).put(`/v1/fragments/${FRAGMENT_ID}`).auth('invalid@email.com', 'incorrect_password').expect(401));

  // If the fragment doesn't exist, should return a 404
  test('invalid id will fail', () => request(app).put(`/v1/fragments/non_exist_id`).auth('user1@email.com', 'password1').set('content-type', 'text/plain').send("this is the new value").expect(404));

  // If the fragment doesn't belong to the current user, return a 404
  test('incorrect owner are denied', () =>
    request(app).put(`/v1/fragments/${FRAGMENT_ID}`).auth('user2@email.com', 'password2').set('content-type', 'text/plain').send("this is the new value").expect(404));

  //unsupported type will fail
  test('unsupported type will get a 415', async () => {
    const res = await request(app).put(`/v1/fragments/${FRAGMENT_ID}`).auth('user1@email.com', 'password1')
      .set('content-type', 'image/pdf');
    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toBe("type not supported");
  });

  //unmatched type will fail
  test('unmatched type will get a 400', async () => {
    const res = await request(app).put(`/v1/fragments/${FRAGMENT_ID}`).auth('user1@email.com', 'password1')
      .set('content-type', 'text/html');
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe("Type doesn't match with existing fragment");
  });

  // Successful result should have all the attributes
  test('Successful result should have all the attributes', async () => {
    const res = await request(app).put(`/v1/fragments/${FRAGMENT_ID}`).auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send("this is the new value");

    const returnId = createHash('sha256').update('user1@email.com').digest('hex');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toMatch(/[A-Za-z0-9_-]+/);
    expect(res.body.fragment.type).toBe("text/plain");
    expect(res.body.fragment.size).toBe(Buffer.byteLength("this is the new value"));
    expect(res.body.fragment.ownerId).toBe(returnId);
    expect(res.body.fragment.created).not.toBeNull();
    expect(res.body.fragment.updated).not.toBe(CREATED);
  });

});
