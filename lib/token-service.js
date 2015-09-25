'use strict';

let bucket = Reach.Redis.bucket('user:token');
let rndm   = Reach.Helpers.Random;

/**
 * @class TokenService
 */
let TokenService = module.exports = {};

/**
 * Generates, stores, and returns a password reset token.
 * @method get
 * @param  {Number} id
 * @return {String} token
 */
TokenService.get = function *(id) {
  let token = rndm.base10(6);
  yield bucket.set(token, id, 60 * 60);
  return token;
};

/**
 * Returns user id based on the token provided.
 * @method getId
 * @param  {String} token
 * @return {Number} id
 */
TokenService.getId = function *(token) {
  let id = yield bucket.get(token);
  if (!id) {
    throw error.parse({
      code    : 'TOKEN_INVALID',
      message : 'The provided password reset token is invalid'
    }, 400)
  }
  return id;
};

/**
 * Deletes a password reset token from the redis store.
 * @method delete
 * @param  {String} token
 */
TokenService.delete = function *(token) {
  yield bucket.del(token);
};