'use strict';

let codes    = require('./lib/errors');
let password = require('./lib/password-service');
let User     = Reach.model('User');
let error    = Reach.Error;
let type     = Reach.Helpers.Type;
let config   = Reach.config.user;

module.exports = function *() {
  let count = yield User.count();
  if (!count) {
    let admins = getAdmins();
    for (let i = 0, len = admins.length; i < len; i++) {
      let user = new User(admins[i]);
      yield password.create(user.password);
      yield user.save();
    }
  }
};

/**
 * @method getAdmins
 * @return {Array}
 */
function getAdmins() {
  if (!config) {
    throw error.parse(codes.CONFIG_MISSING);
  }
  if (!config.admins) {
    throw error.parse(codes.CONFIG_MISSING_ADMINS);
  }
  if (!type.isArray(config.admins)) {
    throw error.parse(codes.CONFIG_INVALID_ADMINS_TYPE);
  }
  return config.admins;
}