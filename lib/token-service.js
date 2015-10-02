'use strict';

let bucket = Reach.Redis.bucket('user:token');
let rndm   = Reach.Helpers.Random;
let error  = Reach.Error;

/**
 * @class TokenService
 */
let TokenService = module.exports = {};

/**
 * Generates, stores, and returns a token.
 * @method get
 * @param  {Object} payload
 * @return {String} token
 */
TokenService.get = function *(payload) {
  let token = rndm.base10(6);
  yield bucket.setJSON(token, payload, 60 * 60);
  return token;
};

/**
 * Returns user id based on the token provided.
 * @method getPayload
 * @param  {String} token
 * @return {Object} payload
 */
TokenService.getPayload = function *(token) {
  let payload = yield bucket.getJSON(token);
  if (!payload) {
    throw error.parse({
      code    : 'TOKEN_INVALID',
      message : 'The provided token is invalid'
    }, 400)
  }
  return payload;
};

/**
 * Deletes a token from the redis store.
 * @method delete
 * @param  {String} token
 */
TokenService.delete = function *(token) {
  yield bucket.del(token);
};
