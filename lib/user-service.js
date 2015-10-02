'use strict';

let tokens = require('./token-service');
let bcrypt = Reach.provider('bcrypt');
let User   = Reach.model('User');
let hooks  = Reach.Hooks;
let error  = Reach.Error;
let relay  = Reach.Relay;

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
  if (data.password) {
    user.password = yield bcrypt.hash(data.password, 10);
  }
  yield user.save();

  // ### Hook

  let hook = hooks.get('user:stored');
  if (hook) {
    yield hook(user);
  }

  // ### Relay

  relay.emit('users', {
    type : 'store',
    data : user.toJSON()
  });

  return user;
};

/**
 * @method verify
 * @param  {String} token
 */
UserService.verify = function *(token) {
  let verify  = hooks.get('user:verify', true);
  let payload = yield tokens.getPayload(token);
  let user    = yield this.get(payload.id);

  // ### Hook
  // Sends the user and payload purpose to the verification hook.

  return yield verify(user, payload.purpose);
};

/**
 * Creates an password access token used to reset a users password.
 * @method passwordToken
 * @param  {Mixed} identifier
 */
UserService.passwordToken = function *(identifier) {
  let getUser   = hooks.get('user:get', true);
  let sendToken = hooks.get('user:send-password-token', true);
  let user      = yield getUser(identifier);
  let token     = yield tokens.get({
    id      : user.id,
    purpose : 'password-reset'
  });
  
  // ### Send Token
  // Transmit the token validating the user for the reset request.
  
  yield sendToken(user, token);
};

/**
 * @method passwordReset
 * @param  {String} token
 * @param  {String} password
 */
UserService.passwordReset = function *(token, password) {
  let payload = yield tokens.getPayload(token);
  if (payload.purpose !== 'password-reset') {
    throw error.parse({
      code    : 'TOKEN_INVALID',
      message : 'The provided token is not a valid reset token.'
    });
  }
  let user = yield this.get(payload.id);
  yield user.update({
    password : yield bcrypt.hash(password, 10)
  });
  yield tokens.delete(token);
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
    data.password = yield bcrypt.hash(data.password, 10);
  }
  yield user.update(data);

  // ### Hook

  let hook = hooks.get('user:updated');
  if (hook) {
    yield hook(user);
  }

  // ### Relay

  relay.emit('users', {
    type : 'update',
    data : user.toJSON()
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

  // ### Hook

  let hook = hooks.get('user:deleted');
  if (hook) {
    yield hook(user);
  }

  // ### Relay

  relay.emit('users', {
    type : 'delete',
    data : user.toJSON()
  });
  return user;
};