'use strict';

let codes       = require('./lib/errors');
let userService = require('./lib/user-service');
let User        = Reach.model('User');
let error       = Reach.Error;
let type        = Reach.Helpers.Type;
let config      = Reach.config.user;

module.exports = function *() {
  let count = yield User.count();
  if (!count) {
    let users = getUsers();
    for (let i = 0, len = users.length; i < len; i++) {
      yield userService.create(users[i]);
    }
  }
};

/**
 * @method getUsers
 * @return {Array}
 */
function getUsers() {
  if (!config) {
    throw error.parse(codes.CONFIG_MISSING);
  }
  if (!config.users) {
    throw error.parse(codes.CONFIG_MISSING_ADMINS);
  }
  if (!type.isArray(config.users)) {
    throw error.parse(codes.CONFIG_INVALID_ADMINS_TYPE);
  }
  return config.users;
}