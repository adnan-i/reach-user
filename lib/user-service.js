'use strict';

let password = require('./password-service');
let User     = Reach.model('User');
let hooks    = Reach.Hooks;
let error    = Reach.Error;
let relay    = Reach.Relay;

/**
 * @class UserService
 */
let UserService = module.exports = {};

/**
 * @method create
 * @param  {Object} data
 * @param  {User}   _user
 * @return {User}
 */
UserService.create = function *(data, _user) {
  let user = new User(data);

  yield password.create(user, data.password);
  yield user.save();

  // ### Register Hook
  // Checks if a registration hook has been defined and runs it.

  let hook = hooks.get('user:register');
  if (hook) {
    yield hook(user);
  }

  // ### Relay
  // Emit the store event for the user resource.

  relay.emit('users', {
    type : 'store',
    user : user.toJSON()
  });

  return user;
};

/**
 * @method passwordToken
 * @param  {Integer} userId
 * @param  {String}  resetUrl
 */
UserService.passwordToken = function *(userId, resetUrl) {
  let user  = yield this.get(userId);
  let token = yield password.getResetToken(user);
  let hook  = hooks.get('user:reset-password');
  if (hook) {
    yield hook(user, token, resetUrl);
  }
};

/**
 * @method passwordReset
 * @param  {String} token
 * @param  {String} pass
 */
UserService.passwordReset = function *(token, pass) {
  let userId = yield password.getTokenId(token);
  let user   = yield this.get(userId);
  yield user.update({
    password : yield password.create(user, pass)
  });
  yield password.delResetToken(token);
};

/**
 * Returns a user with the provided id, optionaly you can provide
 * an authenticated _user to check if they are allowed to retrieve
 * the user in question.
 * @method get
 * @param  {Integer} id
 * @param  {User}    [_user]
 * @return {User}
 */
UserService.get = function *(id, _user) {
  let user = yield User.findById(id);
  if (!user) {
    throw error.parse({
      code    : 'USER_NOT_FOUND',
      message : 'The requested user was not found in our records'
    }, 404);
  }
  if (_user) {
    if (user.id !== _user.id && _user.role !== 'admin') {
      throw error.parse({
        code    : 'USER_CREDENTIALS_INVALID',
        message : 'You do not have access to update this user'
      }, 401);
    }
  }
  return user;
};

/**
 * @method update
 * @param  {Integer} id
 * @param  {Object}  data
 * @param  {User}    _user
 * @return {Mixed}
 */
UserService.update = function *(id, data, _user) {
  let user = yield this.get(id, _user);
  if (data.password) {
    data.password = yield password.create(user, data.password);
  }
  yield user.update(data);
  relay.emit('users', {
    type : 'update',
    user : user.toJSON()
  });
  return user;
};

/**
 * @method delete
 * @param  {Integer} id
 * @param  {User}    _user
 * @return {User}
 */
UserService.delete = function *(id, _user) {
  let user = yield this.get(id, _user);
  yield user.delete();
  relay.emit('users', {
    type : 'delete',
    user : user.toJSON()
  });
  return user;
};