// tests/unit/delete.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {

  var FRAGMENT_ID;

  beforeAll(async () => {
    const content = Buffer.from("this is the value");
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain').send(content);
    FRAGMENT_ID = res.body.fragment.id;
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).delete(`/v1/fragments/${FRAGMENT_ID}`).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).delete(`/v1/fragments/${FRAGMENT_ID}`).auth('invalid@email.com', 'incorrect_password').expect(401));

  // If the fragment doesn't exist, should return a 404
  test('invalid id will fail', () => request(app).delete(`/v1/fragments/non_exist_id`).auth('user1@email.com', 'password1').expect(404));

  // If the fragment doesn't belong to the current user, return a 404
  test('incorrect owner are denied', () =>
    request(app).delete(`/v1/fragments/${FRAGMENT_ID}`).auth('user2@email.com', 'password2').expect(404));

  // Valid username/password pair and the correct id/owner id will get a 200 ok
  test('Successful result should have 200 OK', async () => {
    const res = await request(app).delete(`/v1/fragments/${FRAGMENT_ID}`).auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    const res2 = await request(app).get(`/v1/fragments/${FRAGMENT_ID}`).auth('user1@email.com', 'password1');
    expect(res2.statusCode).toBe(404);

  });

});
