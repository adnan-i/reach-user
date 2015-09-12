'use strict';

let bcrypt  = require('./bcrypt-service');
let rndm    = Reach.Helpers.Random;
let bucket  = Reach.Redis.bucket('user:password');

/**
 * @class PasswordService
 */
let PasswordService = module.exports = {};

/**
 * @method create
 * @param  {User}   user
 * @param  {String} password
 */
PasswordService.create = function *(user, password) {
  user.password = yield bcrypt.hash(password, 10);
};

/**
 * Generates, stores, and returns a password reset token.
 * @method getResetToken
 * @param  {User}
 * @return {String} token
 */
PasswordService.getResetToken = function *(user) {
  let token = rndm(32);
  yield bucket.set(token, user.id, 60 * 60);
  return token;
};

/**
 * Returns user id based on the token provided.
 * @method getTokenId
 * @param  {String}  token
 * @return {Integer} id
 */
PasswordService.getTokenId = function *(token) {
  let id = yield bucket.get(token);
  if (!id) {
    throw error.parse({
      code    : 'USER_INVALID_TOKEN',
      message : 'The provided password reset token is invalid'
    }, 400)
  }
  return id;
};

/**
 * Deletes a password reset token from the redis store.
 * @method delResetToken
 * @param  {String} token
 */
PasswordService.delResetToken = function *(token) {
  yield bucket.del(token);
};