'use strict';

let bcrypt = require('bcryptjs');

/**
 * @class BCryptWrapper
 */
let BCryptWrapper = module.exports = {};

/**
 * @method genSalt
 * @param  {}
 * @param  {}
 * @return {Thunk}
 */
BCryptWrapper.genSalt = (rounds, seedLength) => {
  return function(done) {
    bcrypt.genSalt(rounds, seedLength, done)
  }
}

/**
 * @method hash
 * @param  {}
 * @param  {}
 * @return {Thunk}
 */
BCryptWrapper.hash = (s, salt) => {
  return function(done) {
    bcrypt.hash(s, salt, done)
  }
}

/**
 * @method compare
 * @param  {}
 * @param  {}
 * @return {Thunk}
 */
BCryptWrapper.compare = (s, hash) => {
  return function(done) {
    bcrypt.compare(s, hash, done)
  }
}