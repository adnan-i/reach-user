'use strict';

let userService = require('../lib/user-service');
let error       = Reach.Error;
let config      = Reach.config.user;

Reach.Register.ResourceController('User', 'UsersController', function (controller) {

  /**
   * Stores the user and sends a welcome email.
   * @method store
   * @param  {Object} data
   * @return {User}
   */
  controller.store = function *(data) {
    return yield userService.create(data, this.auth.user);
  };

  /**
   * @method verify
   * @param  {Object} data
   */
  controller.verify = function *(data) {
    return yield userService.verify(data.token);
  };

  /**
   * @method passwordToken
   * @param  {Object} data
   */
  controller.passwordToken = function *(data) {
    return yield userService.passwordToken(data.identifier, data.resetUrl);
  };

  /**
   * @method me
   * @return {User}
   */
  controller.me = function *() {
    return this.auth.user;
  };

  /**
   * @method update
   * @param  {Mixed}  id
   * @param  {Object} data
   * @return {User}
   */
  controller.update = function *(id, data) {
    return yield userService.update(id, data, this.auth.user);
  };

  /**
   * @method passwordReset
   * @param  {Object} data
   */
  controller.passwordReset = function *(data) {
    return yield userService.passwordReset(data.token, data.password);
  };

  /**
   * @method delete
   * @param  {Mixed} id
   * @return {User}
   */
  controller.delete = function *(id) {
    return yield userService.delete(id, this.auth.user);
  };

  /**
   * @property _options
   * @type     Function
   */
  controller._options = config.filter.bind(null, Reach.provider('sequelize/helpers').query);

  return controller;

});
